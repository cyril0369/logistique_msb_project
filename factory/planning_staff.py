# Remarque : j'ai fait trois vues : admin, staffeur, job selon l'affichage demandé dans le frontend
from collections import defaultdict


# fonction principale => input : les staffeurs, les jobs et les creneaux
# output : qui fait quoi et quand
def generer_planning(staffeurs, jobs, creneaux):

    affectations = []

    # pour suivre ce que chaque staffeur a déjà
    heures_par_staff = defaultdict(int)           # combien d'heures il a déjà
    # sur quels créneaux il est déjà
    creneaux_par_staff = defaultdict(list)
    jobs_par_staff_et_creneau = defaultdict(
        set)  # pour vérifier max 1 job/créneau
    creneau_par_id = {c["id_creneau"]: c for c in creneaux}

    # on garde l'ordre des créneaux pour calculer les heures consécutives
    ordre_creneaux = [c["id_creneau"] for c in creneaux]

    # on parcourt chaque job et on cherche qui peut le faire
    for job in jobs:
        id_creneau_job = job["id_creneau"]
        id_competence_requise = job["id_competence_requise"]
        nb_min = job["nb_staffeurs_min"]
        nb_max = job["nb_staffeurs_max"]

        candidats = []

        for staff in staffeurs:
            id_staff = staff["id_staffeur"]

            # 1. Pour voir si le staffeur est dispo sur ce créneau
            if id_creneau_job not in staff["dispos"]:
                continue

            # 1'. vérifier que le créneau est compatible avec le type du staffeur
            heure_creneau = creneau_par_id[id_creneau_job]["heure_debut"]
            type_staff = staff["type_staff"]
            if type_staff == "Jour" and heure_creneau >= "18:00":
                continue
            if type_staff == "Nuit" and heure_creneau < "18:00":
                continue

            # 2. il a la compétence requise ?
            if id_competence_requise not in staff["competences"]:
                continue

            # 3. vérifier la contrainte max 1 job/créneau
            if id_creneau_job in jobs_par_staff_et_creneau[(id_staff, id_creneau_job)]:
                continue
            if len(jobs_par_staff_et_creneau[(id_staff, id_creneau_job)]) >= 1:
                continue

            # 4. il a pas dépassé son max d'heures
            if heures_par_staff[id_staff] >= staff["preference_heures_max"]:
                continue

            # 5. vérifier qu'il fait pas trop d'heures d'affilée
            nb_consec = _compter_consecutives(
                creneaux_par_staff[id_staff],
                id_creneau_job,
                ordre_creneaux
            )
            if nb_consec >= staff["contrainte_heures_consecutives_max"]:
                continue

            candidats.append(staff)

        # on prend en priorité ceux qui ont le moins d'heures pour équilibrer
        candidats.sort(key=lambda s: heures_par_staff[s["id_staffeur"]])

        # on affecte jusqu'à nb_max staffeurs
        nb_a_affecter = min(nb_max, len(candidats))

        for i in range(nb_a_affecter):
            staff = candidats[i]
            id_staff = staff["id_staffeur"]

            affectations.append({
                "id_staffeur": id_staff,
                "id_job": job["id_job"]
            })

            # on met à jour les trackers
            heures_par_staff[id_staff] += 1
            creneaux_par_staff[id_staff].append(id_creneau_job)
            jobs_par_staff_et_creneau[(id_staff, id_creneau_job)].add(
                job["id_job"])

    stats = _calculer_stats(affectations, jobs, staffeurs)

    return {
        "affectations": affectations,
        "stats": stats
    }


# compte combien de créneaux consécutifs un staffeur aurait si on lui ajoute ce créneau
def _compter_consecutives(creneaux_staff, id_creneau_nouveau, ordre_creneaux):

    if id_creneau_nouveau not in ordre_creneaux:
        return 1

    idx = ordre_creneaux.index(id_creneau_nouveau)
    consecutives = 1

    # on remonte en arrière pour voir si les créneaux précédents sont déjà pris
    for i in range(idx - 1, -1, -1):
        if ordre_creneaux[i] in creneaux_staff:
            consecutives += 1
        else:
            break

    return consecutives


# quelques stats sur le résultat
def _calculer_stats(affectations, jobs, staffeurs):

    total_besoins = sum(j["nb_staffeurs_min"] for j in jobs)
    total_affectes = len(affectations)
    taux = round(total_affectes / total_besoins *
                 100, 1) if total_besoins > 0 else 0

    heures_par_staff = defaultdict(int)
    for aff in affectations:
        heures_par_staff[aff["id_staffeur"]] += 1

    moyenne = round(sum(heures_par_staff.values()) /
                    len(staffeurs), 1) if staffeurs else 0

    # on liste les jobs qui n'ont pas eu assez de staffeurs
    affectes_par_job = defaultdict(int)
    for aff in affectations:
        affectes_par_job[aff["id_job"]] += 1

    jobs_non_couverts = [
        j["id_job"]
        for j in jobs
        if affectes_par_job[j["id_job"]] < j["nb_staffeurs_min"]
    ]

    return {
        "total_affectations": total_affectes,
        "taux_couverture": taux,
        "heures_par_staff": dict(heures_par_staff),
        "moyenne_heures": moyenne,
        "jobs_non_couverts": jobs_non_couverts
    }


# formate les données pour la vue admin : organisé par jour puis par créneau
def formatter_vue_admin(affectations, staffeurs, jobs, creneaux):

    creneau_par_id = {c["id_creneau"]: c for c in creneaux}
    job_par_id = {j["id_job"]: j for j in jobs}

    vue = defaultdict(lambda: defaultdict(list))

    for aff in affectations:
        id_job = aff["id_job"]
        job = job_par_id[id_job]
        creneau = creneau_par_id[job["id_creneau"]]

        jour = creneau["jour"]
        heure = f"{creneau['heure_debut']}-{creneau['heure_fin']}"

        vue[jour][heure].append({
            "id_staffeur": aff["id_staffeur"],
            "id_job": id_job
        })

    # convertir en dict normal pour que ce soit compatible JSON
    return {jour: dict(heures) for jour, heures in vue.items()}


# formate le planning d'un staffeur en particulier, par jour
def formatter_vue_mon_planning(affectations, id_staffeur, jobs, creneaux):

    creneau_par_id = {c["id_creneau"]: c for c in creneaux}
    job_par_id = {j["id_job"]: j for j in jobs}

    mon_planning = defaultdict(list)

    for aff in affectations:

        # on filtre, on garde que les affectations de ce staffeur
        if aff["id_staffeur"] != id_staffeur:
            continue

        job = job_par_id[aff["id_job"]]
        creneau = creneau_par_id[job["id_creneau"]]

        mon_planning[creneau["jour"]].append({
            "id_job": aff["id_job"],
            "heure_debut": creneau["heure_debut"],
            "heure_fin": creneau["heure_fin"]
        })

    return dict(mon_planning)


# formate les jobs avec les staffeurs assignés et si le job est complet ou pas
def formatter_vue_jobs(affectations, jobs, creneaux):

    creneau_par_id = {c["id_creneau"]: c for c in creneaux}

    # on regroupe les affectations par job
    staffeurs_par_job = defaultdict(list)
    for aff in affectations:
        staffeurs_par_job[aff["id_job"]].append(aff["id_staffeur"])

    vue = []
    for job in jobs:
        creneau = creneau_par_id[job["id_creneau"]]
        assignes = staffeurs_par_job[job["id_job"]]

        vue.append({
            "id_job": job["id_job"],
            "id_creneau": job["id_creneau"],
            "jour": creneau["jour"],
            "heure_debut": creneau["heure_debut"],
            "heure_fin": creneau["heure_fin"],
            "nb_staffeurs_min": job["nb_staffeurs_min"],
            "nb_staffeurs_max": job["nb_staffeurs_max"],
            "staffeurs_assignes": assignes,
            "complet": len(assignes) >= job["nb_staffeurs_min"]
        })

    return vue


# test local (Balsam)
if __name__ == "__main__":

    creneaux = [
        {"id_creneau": 1, "jour": "Vendredi",
            "heure_debut": "09:00", "heure_fin": "10:00"},
        {"id_creneau": 2, "jour": "Vendredi",
            "heure_debut": "10:00", "heure_fin": "11:00"},
        {"id_creneau": 3, "jour": "Vendredi",
            "heure_debut": "11:00", "heure_fin": "12:00"},
        {"id_creneau": 4, "jour": "Samedi",
            "heure_debut": "09:00", "heure_fin": "10:00"},
        {"id_creneau": 5, "jour": "Samedi",
            "heure_debut": "10:00", "heure_fin": "11:00"},
        {"id_creneau": 6, "jour": "Dimanche",
            "heure_debut": "14:00", "heure_fin": "15:00"},

    ]

    staffeurs = [
        {
            "id_staffeur": 1,
            "preference_heures_max": 4,
            "contrainte_heures_consecutives_max": 3,
            "dispos": [1, 2, 3, 4],
            "type_staff": "Jour",
            "competences": [10, 11]
        },
        {
            "id_staffeur": 2,
            "preference_heures_max": 6,
            "contrainte_heures_consecutives_max": 4,
            "dispos": [2, 3, 4, 5],
            "type_staff": "Nuit",
            "competences": [10, 12]
        },
        {
            "id_staffeur": 3,
            "preference_heures_max": 4,
            "contrainte_heures_consecutives_max": 2,
            "dispos": [1, 2, 5, 6],
            "type_staff": "Jour",
            "competences": [12]
        },
        {
            "id_staffeur": 4,
            "preference_heures_max": 8,
            "contrainte_heures_consecutives_max": 4,
            "type_staff": "Jour",
            "dispos": [3, 4, 5, 6],
            "competences": [11, 12]
        },
    ]

    jobs = [
        {"id_job": 100, "id_competence_requise": 10, "id_creneau": 1,
            "nb_staffeurs_min": 2, "nb_staffeurs_max": 2},
        {"id_job": 101, "id_competence_requise": 12, "id_creneau": 2,
            "nb_staffeurs_min": 1, "nb_staffeurs_max": 2},
        {"id_job": 102, "id_competence_requise": 11, "id_creneau": 3,
            "nb_staffeurs_min": 1, "nb_staffeurs_max": 1},
        {"id_job": 103, "id_competence_requise": 12, "id_creneau": 4,
            "nb_staffeurs_min": 2, "nb_staffeurs_max": 3},
        {"id_job": 104, "id_competence_requise": 10, "id_creneau": 6,
            "nb_staffeurs_min": 1, "nb_staffeurs_max": 2},
    ]

    # noms pour rendre le test lisible
    noms_staffeurs = {1: "Balsam", 2: "Margaux", 3: "Pierre", 4: "Cyril"}
    noms_jobs = {
        100: "Bar - Vendredi 09h",
        101: "Arbitrage - Vendredi 10h",
        102: "Cuisine - Vendredi 11h",
        103: "Arbitrage - Samedi 09h",
        104: "Bar - Dimanche 14h"
    }

    resultat = generer_planning(staffeurs, jobs, creneaux)

    print("affectations :")
    for aff in resultat["affectations"]:
        nom_staff = noms_staffeurs.get(
            aff["id_staffeur"], f"Staffeur {aff['id_staffeur']}")
        nom_job = noms_jobs.get(aff["id_job"], f"Job {aff['id_job']}")
        print(f"  {nom_staff} -> {nom_job}")

    print("\nstats :")
    stats = resultat["stats"]
    print(f"  total affectations : {stats['total_affectations']}")
    print(f"  taux de couverture : {stats['taux_couverture']}%")
    print(f"  moyenne heures/staff : {stats['moyenne_heures']}h")

    print("\nvue admin :")
    vue_admin = formatter_vue_admin(
        resultat["affectations"], staffeurs, jobs, creneaux)
    for jour, heures in vue_admin.items():
        print(f"  {jour} :")
        for heure, affs in heures.items():
            noms = [noms_staffeurs.get(
                a["id_staffeur"], str(a["id_staffeur"])) for a in affs]
            nom_job = noms_jobs.get(
                affs[0]["id_job"], f"Job {affs[0]['id_job']}")
            print(f"    {heure} | {nom_job} -> {', '.join(noms)}")

    print("\nvue mon planning (staffeur 1 = Balsam) :")
    vue_margaux = formatter_vue_mon_planning(
        resultat["affectations"], 1, jobs, creneaux)
    for jour, affs in vue_margaux.items():
        print(f"  {jour} :")
        for aff in affs:
            print(
                f"    {aff['heure_debut']}-{aff['heure_fin']} -> {noms_jobs.get(aff['id_job'], str(aff['id_job']))}")

    print("\nvue jobs :")
    vue_jobs = formatter_vue_jobs(resultat["affectations"], jobs, creneaux)
    for j in vue_jobs:
        noms = [noms_staffeurs.get(s, str(s)) for s in j["staffeurs_assignes"]]
        statut = "complet" if j["complet"] else "incomplet"
        print(f"  {j['jour']} {j['heure_debut']}-{j['heure_fin']} | {noms_jobs.get(j['id_job'], str(j['id_job']))} | {statut} | {', '.join(noms) if noms else 'aucun staff'}")
