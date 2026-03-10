import os
import psycopg2
from psycopg2.extras import RealDictCursor
from planning_staff import generer_planning, formatter_vue_admin, formatter_vue_mon_planning, formatter_vue_jobs

# Configuration de connexion à la base de données
DB_CONFIG = {
    'dbname': 'msb_db',
    'user': 'msb_user',
    'password': 'msb_password',
    'host': 'localhost',
    'port': 5432
}


def get_connection():
    """Crée une connexion à la base de données"""
    return psycopg2.connect(**DB_CONFIG)


def recuperer_creneaux(conn):
    """Récupère tous les créneaux de la base de données"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT 
                id_creneau,
                jour,
                heure_debut::text as heure_debut,
                heure_fin::text as heure_fin
            FROM creneau
            ORDER BY 
                CASE jour
                    WHEN 'Vendredi' THEN 1
                    WHEN 'Samedi' THEN 2
                    WHEN 'Dimanche' THEN 3
                    ELSE 4
                END,
                heure_debut
        """)
        return [dict(row) for row in cur.fetchall()]


def recuperer_staffeurs(conn):
    """Récupère tous les staffeurs avec leurs disponibilités et compétences"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Récupérer les staffeurs avec leurs préférences
        cur.execute("""
            SELECT 
                s.id_staffeur,
                s.type_staff,
                s.preference_heures_max,
                s.contrainte_heures_consecutives_max
            FROM staffeur s
        """)
        staffeurs = [dict(row) for row in cur.fetchall()]

        # Pour chaque staffeur, récupérer ses disponibilités
        for staff in staffeurs:
            cur.execute("""
                SELECT id_creneau
                FROM staffeur_disponibilite
                WHERE id_staffeur = %s
            """, (staff['id_staffeur'],))
            staff['dispos'] = [row['id_creneau'] for row in cur.fetchall()]

            # Récupérer ses compétences
            cur.execute("""
                SELECT id_competence
                FROM staffeur_competence
                WHERE id_staffeur = %s
            """, (staff['id_staffeur'],))
            staff['competences'] = [row['id_competence']
                                    for row in cur.fetchall()]

        return staffeurs


def recuperer_jobs(conn):
    """Récupère tous les jobs de la base de données"""
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT 
                id_job,
                id_competence_requise,
                id_creneau,
                nb_staffeurs_min,
                nb_staffeurs_max
            FROM job
        """)
        return [dict(row) for row in cur.fetchall()]


def sauvegarder_affectations(conn, affectations):
    """Sauvegarde les affectations dans la table affectation_staff"""
    affectations_creees = 0
    affectations_echouees = 0

    with conn.cursor() as cur:
        for aff in affectations:
            try:
                cur.execute("""
                    INSERT INTO affectation_staff (id_job, id_staffeur)
                    VALUES (%s, %s)
                    ON CONFLICT (id_job, id_staffeur) DO NOTHING
                """, (aff['id_job'], aff['id_staffeur']))

                if cur.rowcount > 0:
                    affectations_creees += 1

            except Exception as e:
                print(
                    f"   ✗ Erreur affectation job {aff['id_job']} → staffeur {aff['id_staffeur']}: {e}")
                affectations_echouees += 1
                conn.rollback()

        conn.commit()

    return affectations_creees, affectations_echouees


def creer_planning_staff(conn):
    """Fonction principale : récupère les données et crée le planning des staffeurs"""
    print("🗓️  Création du planning des staffeurs...")
    print()

    # 1. Récupérer toutes les données nécessaires
    print("📥 Récupération des données...")
    creneaux = recuperer_creneaux(conn)
    print(f"   ✓ {len(creneaux)} créneaux récupérés")

    staffeurs = recuperer_staffeurs(conn)
    print(f"   ✓ {len(staffeurs)} staffeurs récupérés")

    jobs = recuperer_jobs(conn)
    print(f"   ✓ {len(jobs)} jobs récupérés")
    print()

    print(staffeurs)
    print(creneaux)

    # 2. Générer le planning avec l'algorithme de planning_staff.py
    print("🔄 Génération du planning...")
    resultat = generer_planning(staffeurs, jobs, creneaux)
    affectations = resultat['affectations']
    stats = resultat['stats']
    print(f"   ✓ {len(affectations)} affectations générées")
    print()

    # 3. Sauvegarder les affectations dans la base de données
    print("💾 Sauvegarde des affectations...")
    nb_creees, nb_echouees = sauvegarder_affectations(conn, affectations)
    print(f"   ✓ {nb_creees} affectations créées")
    if nb_echouees > 0:
        print(f"   ✗ {nb_echouees} affectations échouées")
    print()

    # 4. Afficher les statistiques
    print("📊 Statistiques du planning :")
    print(f"   • Total affectations : {stats['total_affectations']}")
    print(f"   • Taux de couverture : {stats['taux_couverture']}%")
    print(f"   • Moyenne heures/staff : {stats['moyenne_heures']}h")

    if stats['jobs_non_couverts']:
        print(
            f"   ⚠️  {len(stats['jobs_non_couverts'])} jobs non couverts (minimum non atteint)")
    else:
        print(f"   ✅ Tous les jobs ont atteint leur minimum de staffeurs")
    print()

    # 5. Afficher un aperçu du planning par jour (vue admin)
    print("📅 Aperçu du planning :")
    vue_admin = formatter_vue_admin(affectations, staffeurs, jobs, creneaux)
    for jour in ['Vendredi', 'Samedi', 'Dimanche']:
        if jour in vue_admin:
            print(f"\n   {jour} :")
            for heure, affs in sorted(vue_admin[jour].items()):
                nb_staffeurs = len(affs)
                print(f"      {heure} : {nb_staffeurs} staffeur(s) affecté(s)")


def main():
    """Fonction principale"""
    try:
        conn = get_connection()
        print("✅ Connexion à la base de données réussie")
        print()

        creer_planning_staff(conn)

        conn.close()
        print()
        print("✅ Planning créé avec succès!")

    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
