#!/usr/bin/env python3
import argparse
import os
import sys
from collections import defaultdict

import psycopg2
from psycopg2.extras import RealDictCursor

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional dependency
    def load_dotenv() -> bool:
        return False

from creer_poules import creer_poules
from planning_staff import generer_planning
from planning_tournoi import generer_planning_tournoi

STAFF_COLUMN_TO_COMPETENCE_ID = {
    "bar": 1,
    "cuisine": 2,
    "arbitre_beach_rugby": 3,
    "arbitre_beach_soccer": 4,
    "arbitre_beach_volley": 5,
    "arbitre_dodgeball": 6,
    "arbitre_handball": 7,
}


def fetch_equipes(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
              id_equipe,
              id_sport,
              niveau::text AS niveau,
              categorie::text AS categorie
            FROM equipe
            ORDER BY id_sport, niveau, categorie, id_equipe
            """
        )
        return [dict(r) for r in cur.fetchall()]


def fetch_creneaux(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
                            id AS id_creneau,
                            INITCAP(day_of_week) AS jour,
                            LPAD(start_hour::text, 2, '0') || ':00' AS heure_debut,
                            LPAD(end_hour::text, 2, '0') || ':00' AS heure_fin
                        FROM creneaux
            ORDER BY
                            CASE day_of_week
                                WHEN 'vendredi' THEN 1
                                WHEN 'samedi' THEN 2
                                WHEN 'dimanche' THEN 3
                ELSE 99
              END,
                            start_hour,
                            end_hour
            """
        )
        return [dict(r) for r in cur.fetchall()]


def fetch_staffeurs(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT id AS id_creneau FROM creneaux ORDER BY id")
        all_creneau_ids = [int(r["id_creneau"]) for r in cur.fetchall()]

    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
              s.id AS id_staffeur,
              8 AS preference_heures_max,
              3 AS contrainte_heures_consecutives_max,
              COALESCE(array_agg(DISTINCT sd.id_creneau) FILTER (WHERE sd.id_creneau IS NOT NULL), '{}') AS dispos,
              COALESCE(array_agg(DISTINCT sc.id_competence) FILTER (WHERE sc.id_competence IS NOT NULL), '{}') AS competences
            FROM staff s
            LEFT JOIN staffeur_disponibilite sd ON sd.id_staffeur = s.id
            LEFT JOIN staffeur_competence sc ON sc.id_staffeur = s.id
            GROUP BY s.id
            ORDER BY s.id
            """
        )
        rows = [dict(r) for r in cur.fetchall()]

    # Fallback competence mapping from existing staff boolean columns.
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT id, bar, cuisine, arbitre_beach_rugby, arbitre_beach_soccer,
                   arbitre_beach_volley, arbitre_dodgeball, arbitre_handball
            FROM staff
            ORDER BY id
            """
        )
        flags = {r["id"]: dict(r) for r in cur.fetchall()}

    for row in rows:
        staff_id = row["id_staffeur"]
        # If no explicit availability is stored, consider the staffer available on all slots.
        if not row.get("dispos"):
            row["dispos"] = list(all_creneau_ids)

        existing = set(row.get("competences") or [])
        flag_row = flags.get(staff_id, {})
        for col, comp_id in STAFF_COLUMN_TO_COMPETENCE_ID.items():
            if int(flag_row.get(col) or 0) == 1:
                existing.add(comp_id)
        row["competences"] = sorted(existing)

    return rows


def fetch_jobs(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
                            id AS id_job,
                            staff_type AS id_competence_requise,
                            creneau AS id_creneau,
                            COALESCE(staff_needed, 1) AS nb_staffeurs_min,
                            COALESCE(staff_needed, 1) AS nb_staffeurs_max
                        FROM jobs
                        WHERE creneau IS NOT NULL
                        ORDER BY creneau, id
            """
        )
        return [dict(r) for r in cur.fetchall()]


def fetch_terrains(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT id_terrain, nom_terrain, type_terrain
            FROM terrain
            WHERE statut = 'Disponible'
            ORDER BY id_terrain
            """
        )
        return [dict(r) for r in cur.fetchall()]


def write_poules(conn, poules):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM poule_equipe")
        cur.execute("DELETE FROM poule")

        for p in poules:
            cur.execute(
                """
                INSERT INTO poule (id_sport, nom_poule, niveau, categorie)
                VALUES (%s, %s, %s::niveau_type, %s::categorie_equipe_type)
                RETURNING id_poule
                """,
                (p["id_sport"], p["nom_poule"], p["niveau"], p["categorie"]),
            )
            id_poule = cur.fetchone()[0]

            for position, id_equipe in enumerate(p["equipes"], start=1):
                cur.execute(
                    """
                    INSERT INTO poule_equipe (id_poule, id_equipe, position)
                    VALUES (%s, %s, %s)
                    """,
                    (id_poule, id_equipe, position),
                )


def write_affectations_staff(conn, affectations, preserve_existing=False):
    with conn.cursor() as cur:
        if not preserve_existing:
            cur.execute("DELETE FROM affectation_staff")
            for aff in affectations:
                cur.execute(
                    """
                    INSERT INTO affectation_staff (id_staffeur, id_job)
                    VALUES (%s, %s)
                    ON CONFLICT (id_staffeur, id_job) DO NOTHING
                    """,
                    (aff["id_staffeur"], aff["id_job"]),
                )

            # Keep existing jobs table in sync for current app screens.
            cur.execute("UPDATE jobs SET staff_assigned = '{}'::int[]")
            cur.execute(
                """
                UPDATE jobs j
                SET staff_assigned = src.staff_ids
                FROM (
                  SELECT id_job, array_agg(id_staffeur ORDER BY id_staffeur)::int[] AS staff_ids
                  FROM affectation_staff
                  GROUP BY id_job
                ) AS src
                WHERE j.id = src.id_job
                """
            )
            return

        cur.execute(
            """
            SELECT id, creneau, COALESCE(staff_needed, 1) AS staff_needed,
                   COALESCE(staff_assigned, '{}'::int[]) AS staff_assigned
            FROM jobs
            """
        )
        jobs_rows = cur.fetchall()

        job_meta = {}
        merged_by_job = {}
        busy_by_creneau = defaultdict(set)

        for job_id, creneau_id, staff_needed, staff_assigned in jobs_rows:
            assigned = [int(s) for s in (staff_assigned or [])]
            job_meta[int(job_id)] = {
                "creneau": int(creneau_id) if creneau_id is not None else None,
                "staff_needed": int(staff_needed) if staff_needed is not None else 1,
            }
            merged_by_job[int(job_id)] = list(dict.fromkeys(assigned))
            if creneau_id is not None:
                busy_by_creneau[int(creneau_id)].update(merged_by_job[int(job_id)])

        for aff in affectations:
            job_id = int(aff["id_job"])
            staff_id = int(aff["id_staffeur"])

            meta = job_meta.get(job_id)
            if not meta:
                continue

            existing = merged_by_job.setdefault(job_id, [])
            if staff_id in existing:
                continue
            if len(existing) >= meta["staff_needed"]:
                continue

            creneau_id = meta["creneau"]
            if creneau_id is not None and staff_id in busy_by_creneau[creneau_id]:
                continue

            existing.append(staff_id)
            if creneau_id is not None:
                busy_by_creneau[creneau_id].add(staff_id)

        cur.execute("DELETE FROM affectation_staff")
        for job_id, staff_ids in merged_by_job.items():
            for staff_id in staff_ids:
                cur.execute(
                    """
                    INSERT INTO affectation_staff (id_staffeur, id_job)
                    VALUES (%s, %s)
                    ON CONFLICT (id_staffeur, id_job) DO NOTHING
                    """,
                    (staff_id, job_id),
                )

        cur.execute("UPDATE jobs SET staff_assigned = '{}'::int[]")
        for job_id, staff_ids in merged_by_job.items():
            cur.execute(
                "UPDATE jobs SET staff_assigned = %s::int[] WHERE id = %s",
                (staff_ids, job_id),
            )


def fetch_poules_from_db(conn):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
              p.id_sport,
              p.nom_poule,
              p.niveau::text AS niveau,
              p.categorie::text AS categorie,
              COALESCE(array_agg(pe.id_equipe ORDER BY pe.position, pe.id_equipe), '{}') AS equipes
            FROM poule p
            LEFT JOIN poule_equipe pe ON pe.id_poule = p.id_poule
            GROUP BY p.id_poule, p.id_sport, p.nom_poule, p.niveau, p.categorie
            ORDER BY p.id_sport, p.nom_poule
            """
        )
        return [dict(r) for r in cur.fetchall()]


def run_creer_poules(conn, max_par_poule, write_db):
    equipes = fetch_equipes(conn)
    poules = creer_poules(equipes, max_par_poule=max_par_poule)
    if write_db:
        write_poules(conn, poules)
    return {
        "equipes": len(equipes),
        "poules": len(poules),
        "sample": poules[0] if poules else None,
    }


def run_planning_staff(conn, write_db, preserve_existing_staff=False):
    creneaux = fetch_creneaux(conn)
    staffeurs = fetch_staffeurs(conn)
    jobs = fetch_jobs(conn)
    planning_staff = generer_planning(staffeurs, jobs, creneaux)
    if write_db:
        write_affectations_staff(
            conn,
            planning_staff["affectations"],
            preserve_existing=preserve_existing_staff,
        )
    stats = planning_staff["stats"]
    return {
        "creneaux": len(creneaux),
        "staffeurs": len(staffeurs),
        "jobs": len(jobs),
        "affectations_staff": len(planning_staff["affectations"]),
        "taux_couverture": stats["taux_couverture"],
        "jobs_non_couverts": len(stats["jobs_non_couverts"]),
        "sample": planning_staff["affectations"][0] if planning_staff["affectations"] else None,
    }


def run_planning_tournoi(conn, max_par_poule, write_db):
    creneaux = fetch_creneaux(conn)
    terrains = fetch_terrains(conn)
    poules = fetch_poules_from_db(conn)

    # If poules are empty, generate from teams as fallback.
    if not poules:
        equipes = fetch_equipes(conn)
        poules = creer_poules(equipes, max_par_poule=max_par_poule)
        if write_db:
            write_poules(conn, poules)

    planning_tournoi = generer_planning_tournoi(poules, creneaux, terrains)
    if write_db:
        write_matchs(conn, planning_tournoi)

    return {
        "poules": len(poules),
        "creneaux": len(creneaux),
        "terrains": len(terrains),
        "matchs_planifies": len(planning_tournoi),
        "sample": planning_tournoi[0] if planning_tournoi else None,
    }


def write_matchs(conn, matchs):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM match")

        # Map (id_sport, nom_poule) -> id_poule once for fast inserts.
        cur.execute("SELECT id_poule, id_sport, nom_poule FROM poule")
        rows = cur.fetchall()
        poule_map = {(r[1], r[2]): r[0] for r in rows}

        for m in matchs:
            id_poule = poule_map.get((m["id_sport"], m["nom_poule"]))
            cur.execute(
                """
                INSERT INTO match (
                  id_poule, id_sport, id_terrain, id_creneau, id_equipe1, id_equipe2,
                  score_equipe1, score_equipe2, statut
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Planifie')
                """,
                (
                    id_poule,
                    m["id_sport"],
                    m["id_terrain"],
                    m["id_creneau"],
                    m["id_equipe1"],
                    m["id_equipe2"],
                    m["score_equipe1"],
                    m["score_equipe2"],
                ),
            )


def main():
    parser = argparse.ArgumentParser(
        description="Run V2 planning scripts with PostgreSQL as input"
    )
    parser.add_argument(
        "--database-url",
        default=None,
        help="PostgreSQL connection string; falls back to DATABASE_URL",
    )
    parser.add_argument(
        "--max-par-poule",
        type=int,
        default=4,
        help="Max teams per poule for creer_poules",
    )
    parser.add_argument(
        "--script",
        choices=["creer_poules", "planning_staff", "planning_tournoi", "all"],
        default="all",
        help="Which script to run",
    )
    parser.add_argument(
        "--write-db",
        action="store_true",
        help="Persist generated poules/affectations/matchs in DB",
    )
    parser.add_argument(
        "--preserve-existing-staff",
        action="store_true",
        help="Keep existing staff assignments and only add new ones where slots remain",
    )
    args = parser.parse_args()

    load_dotenv()
    database_url = args.database_url or os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is required (env or --database-url)", file=sys.stderr)
        return 2

    conn = psycopg2.connect(database_url)

    try:
        if args.script == "creer_poules":
            result = run_creer_poules(conn, args.max_par_poule, args.write_db)
            print("SCRIPT=creer_poules")
            print(f"equipes={result['equipes']}")
            print(f"poules={result['poules']}")
            if result["sample"]:
                print("SAMPLE=", result["sample"])
        elif args.script == "planning_staff":
            result = run_planning_staff(conn, args.write_db, args.preserve_existing_staff)
            print("SCRIPT=planning_staff")
            print(f"creneaux={result['creneaux']} staffeurs={result['staffeurs']} jobs={result['jobs']}")
            print(f"affectations_staff={result['affectations_staff']}")
            print(f"taux_couverture={result['taux_couverture']}")
            print(f"jobs_non_couverts={result['jobs_non_couverts']}")
            if result["sample"]:
                print("SAMPLE=", result["sample"])
        elif args.script == "planning_tournoi":
            result = run_planning_tournoi(conn, args.max_par_poule, args.write_db)
            print("SCRIPT=planning_tournoi")
            print(f"poules={result['poules']} creneaux={result['creneaux']} terrains={result['terrains']}")
            print(f"matchs_planifies={result['matchs_planifies']}")
            if result["sample"]:
                print("SAMPLE=", result["sample"])
        else:
            a = run_creer_poules(conn, args.max_par_poule, args.write_db)
            b = run_planning_staff(conn, args.write_db, args.preserve_existing_staff)
            c = run_planning_tournoi(conn, args.max_par_poule, args.write_db)
            print("SCRIPT=all")
            print(f"equipes={a['equipes']} poules={a['poules']}")
            print(f"staff_affectations={b['affectations_staff']} taux_couverture={b['taux_couverture']}")
            print(f"tournoi_matchs={c['matchs_planifies']}")

        if args.write_db:
            conn.commit()
            print("DB_WRITE=done")
        else:
            conn.rollback()
            print("DB_WRITE=skipped (dry-run)")

        return 0
    except Exception as exc:
        conn.rollback()
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
