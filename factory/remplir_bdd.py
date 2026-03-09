"""
Script pour remplir manuellement la base de données MSB avec des données de test
Usage: python factory/remplir_bdd.py
"""

import psycopg2
from psycopg2.extras import execute_values
import bcrypt
from datetime import time

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


def hash_password(password):
    """Hash un mot de passe avec bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def remplir_ecoles(conn):
    """Remplit la table ecole"""
    print("📚 Remplissage de la table ECOLE...")

    ecoles = [
        ('Centrale Marseille', 'Marseille', 'CMA'),
        ('Centrale Lyon', 'Lyon', 'CLL'),
        ('Centrale Nantes', 'Nantes', 'CLN'),
        ('Polytech Marseille', 'Marseille', 'PMA'),
        ('INSA Lyon', 'Lyon', 'INSA'),
        ('Mines Saint-Etienne', 'Saint-Etienne', 'MSE'),
        ('Arts et Métiers', 'Aix-en-Provence', 'ENSAM'),
        ('Grenoble INP', 'Grenoble', 'GRE'),
    ]

    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO ecole (nom_ecole, ville, code_ecole) VALUES (%s, %s, %s) ON CONFLICT (code_ecole) DO NOTHING",
            ecoles
        )
    conn.commit()
    print(f"   ✓ {len(ecoles)} écoles insérées")


def remplir_competences(conn):
    """Remplit la table competence"""
    print("🎯 Remplissage de la table COMPETENCE...")

    competences = [
        # Bar
        ('Service au bar', 'Bar'),
        ('Préparation cocktails', 'Bar'),
        ('Gestion caisse bar', 'Bar'),

        # Cuisine
        ('Préparation sandwiches', 'Cuisine'),
        ('Cuisson grill', 'Cuisine'),
        ('Service cuisine', 'Cuisine'),
        ('Hygiène alimentaire', 'Cuisine'),

        # Arbitrage
        ('Arbitrage Beach Volley', 'Arbitrage'),
        ('Arbitrage Beach Soccer', 'Arbitrage'),
        ('Arbitrage Basketball', 'Arbitrage'),
        ('Arbitrage Rugby', 'Arbitrage'),

        # Logistique
        ('Montage structures', 'Logistique'),
        ('Transport matériel', 'Logistique'),
        ('Gestion stocks', 'Logistique'),

        # Sécurité
        ('Surveillance publique', 'Securite'),
        ('Premiers secours PSC1', 'Securite'),
        ('Gestion conflits', 'Securite'),

        # Animation
        ('Animation micro', 'Animation'),
        ('DJ/Musique', 'Animation'),
        ('Animation jeux', 'Animation'),

        # Secours
        ('PSE1', 'Secours'),
        ('PSE2', 'Secours'),
        ('Infirmier(e)', 'Secours'),
    ]

    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO competence (nom_competence, categorie) VALUES (%s, %s::competence_categorie_type)",
            competences
        )
    conn.commit()
    print(f"   ✓ {len(competences)} compétences insérées")

    # Retourner les IDs pour les utiliser plus tard
    with conn.cursor() as cur:
        cur.execute("SELECT id_competence, nom_competence FROM competence")
        return {nom: id_comp for id_comp, nom in cur.fetchall()}


def remplir_creneaux(conn):
    """Remplit la table creneau"""
    print("🕐 Remplissage de la table CRENEAU...")

    creneaux = []

    # Vendredi
    horaires_vendredi = [
        ('09:00', '10:00', 'Matin 1'),
        ('10:00', '11:00', 'Matin 2'),
        ('11:00', '12:00', 'Matin 3'),
        ('12:00', '13:00', 'Déjeuner'),
        ('14:00', '15:00', 'Après-midi 1'),
        ('15:00', '16:00', 'Après-midi 2'),
        ('16:00', '17:00', 'Après-midi 3'),
        ('17:00', '18:00', 'Après-midi 4'),
        ('18:00', '19:00', 'Soirée 1'),
        ('19:00', '20:00', 'Soirée 2'),
        ('20:00', '21:00', 'Soirée 3'),
        ('21:00', '22:00', 'Nuit 1'),
        ('22:00', '23:00', 'Nuit 2'),
        ('23:00', '00:00', 'Nuit 3'),
    ]

    # Samedi
    horaires_samedi = [
        ('08:00', '09:00', 'Réveil'),
        ('09:00', '10:00', 'Matin 1'),
        ('10:00', '11:00', 'Matin 2'),
        ('11:00', '12:00', 'Matin 3'),
        ('12:00', '13:00', 'Déjeuner'),
        ('13:00', '14:00', 'Début aprem'),
        ('14:00', '15:00', 'Après-midi 1'),
        ('15:00', '16:00', 'Après-midi 2'),
        ('16:00', '17:00', 'Après-midi 3'),
        ('17:00', '18:00', 'Après-midi 4'),
        ('18:00', '19:00', 'Soirée 1'),
        ('19:00', '20:00', 'Soirée 2'),
        ('20:00', '21:00', 'Soirée 3'),
        ('21:00', '22:00', 'Nuit 1'),
        ('22:00', '23:00', 'Nuit 2'),
        ('23:00', '00:00', 'Nuit 3'),
    ]

    # Dimanche
    horaires_dimanche = [
        ('08:00', '09:00', 'Réveil'),
        ('09:00', '10:00', 'Matin 1'),
        ('10:00', '11:00', 'Matin 2'),
        ('11:00', '12:00', 'Matin 3'),
        ('12:00', '13:00', 'Déjeuner'),
        ('13:00', '14:00', 'Début aprem'),
        ('14:00', '15:00', 'Finales'),
        ('15:00', '16:00', 'Podiums'),
        ('16:00', '17:00', 'Rangement'),
    ]

    for h_debut, h_fin, libelle in horaires_vendredi:
        creneaux.append(('Vendredi', h_debut, h_fin, libelle))

    for h_debut, h_fin, libelle in horaires_samedi:
        creneaux.append(('Samedi', h_debut, h_fin, libelle))

    for h_debut, h_fin, libelle in horaires_dimanche:
        creneaux.append(('Dimanche', h_debut, h_fin, libelle))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO creneau (jour, heure_debut, heure_fin, libelle) 
               VALUES (%s::jour_type, %s, %s, %s) 
               ON CONFLICT (jour, heure_debut, heure_fin) DO NOTHING""",
            creneaux
        )
    conn.commit()
    print(f"   ✓ {len(creneaux)} créneaux insérés")

    # Retourner les IDs
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id_creneau, jour, heure_debut, heure_fin FROM creneau ORDER BY id_creneau")
        return cur.fetchall()


def remplir_poles_msb(conn):
    """Remplit la table pole_msb"""
    print("🎪 Remplissage de la table POLE_MSB...")

    poles = [
        ('Bureau Restreint', 'Coordination générale de l\'événement'),
        ('Logistique', 'Gestion du matériel et des infrastructures'),
        ('Tournoi', 'Organisation des matchs et arbitrage'),
        ('Ecole', 'Accueil et gestion des écoles participantes'),
        ('Repas', 'Gestion de la restauration'),
        ('Soirée', 'Animation et organisation des soirées'),
        ('Sécurité', 'Surveillance et secours'),
        ('Communication', 'Communication et réseaux sociaux'),
        ('Partenariat', 'Gestion des partenaires et sponsors'),
    ]

    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO pole_msb (nom_pole, description) VALUES (%s, %s)",
            poles
        )
    conn.commit()
    print(f"   ✓ {len(poles)} pôles insérés")

    # Retourner les IDs
    with conn.cursor() as cur:
        cur.execute("SELECT id_pole, nom_pole FROM pole_msb")
        return {nom: id_pole for id_pole, nom in cur.fetchall()}


def remplir_staffeurs(conn, competences_ids, pole_ids):
    """Remplit les tables personne et staffeur avec 20 staffeurs"""
    print("👥 Remplissage de 20 STAFFEURS...")

    # Liste de staffeurs avec des profils variés
    staffeurs = [
        # Nom, Prenom, Email, Tel, Genre, Type_Staff, Compétences (noms)
        ('Dupont', 'Pierre', 'pierre.dupont@centrale-marseille.fr', '0612345678', 'Homme', 'Mixte',
         ['Service au bar', 'Gestion caisse bar', 'Arbitrage Beach Volley']),

        ('Martin', 'Sophie', 'sophie.martin@centrale-marseille.fr', '0623456789', 'Femme', 'Jour',
         ['Préparation sandwiches', 'Service cuisine', 'Hygiène alimentaire']),

        ('Bernard', 'Lucas', 'lucas.bernard@centrale-marseille.fr', '0634567890', 'Homme', 'Nuit',
         ['Service au bar', 'Préparation cocktails', 'DJ/Musique']),

        ('Dubois', 'Emma', 'emma.dubois@centrale-marseille.fr', '0645678901', 'Femme', 'Mixte',
         ['Arbitrage Beach Volley', 'Arbitrage Beach Soccer', 'Premiers secours PSC1']),

        ('Moreau', 'Thomas', 'thomas.moreau@centrale-marseille.fr', '0656789012', 'Homme', 'Jour',
         ['Montage structures', 'Transport matériel', 'Gestion stocks']),

        ('Petit', 'Léa', 'lea.petit@centrale-marseille.fr', '0667890123', 'Femme', 'Mixte',
         ['Animation micro', 'Animation jeux', 'Service au bar']),

        ('Roux', 'Hugo', 'hugo.roux@centrale-marseille.fr', '0678901234', 'Homme', 'Nuit',
         ['Surveillance publique', 'Gestion conflits', 'Premiers secours PSC1']),

        ('Fournier', 'Chloé', 'chloe.fournier@centrale-marseille.fr', '0689012345', 'Femme', 'Jour',
         ['PSE2', 'Infirmier(e)', 'Premiers secours PSC1']),

        ('Girard', 'Maxime', 'maxime.girard@centrale-marseille.fr', '0690123456', 'Homme', 'Mixte',
         ['Arbitrage Basketball', 'Arbitrage Rugby', 'Arbitrage Beach Soccer']),

        ('Bonnet', 'Sarah', 'sarah.bonnet@centrale-marseille.fr', '0601234567', 'Femme', 'Nuit',
         ['Service au bar', 'Préparation cocktails', 'Animation jeux']),

        ('Lambert', 'Antoine', 'antoine.lambert@centrale-marseille.fr', '0612345679', 'Homme', 'Jour',
         ['Cuisson grill', 'Service cuisine', 'Hygiène alimentaire']),

        ('Fontaine', 'Julie', 'julie.fontaine@centrale-marseille.fr', '0623456780', 'Femme', 'Mixte',
         ['Animation micro', 'DJ/Musique', 'Animation jeux']),

        ('Chevalier', 'Nathan', 'nathan.chevalier@centrale-marseille.fr', '0634567891', 'Homme', 'Nuit',
         ['Surveillance publique', 'Montage structures', 'Transport matériel']),

        ('Gauthier', 'Manon', 'manon.gauthier@centrale-marseille.fr', '0645678902', 'Femme', 'Jour',
         ['Gestion caisse bar', 'Service au bar', 'Gestion stocks']),

        ('Perrin', 'Alexandre', 'alexandre.perrin@centrale-marseille.fr', '0656789013', 'Homme', 'Mixte',
         ['Arbitrage Beach Volley', 'Animation micro', 'Surveillance publique']),

        ('Morel', 'Clara', 'clara.morel@centrale-marseille.fr', '0667890124', 'Femme', 'Nuit',
         ['Service au bar', 'Préparation cocktails', 'DJ/Musique']),

        ('Simon', 'Théo', 'theo.simon@centrale-marseille.fr', '0678901235', 'Homme', 'Jour',
         ['Montage structures', 'Transport matériel', 'Cuisson grill']),

        ('Michel', 'Camille', 'camille.michel@centrale-marseille.fr', '0689012346', 'Femme', 'Mixte',
         ['PSE1', 'Premiers secours PSC1', 'Service cuisine']),

        ('Lefevre', 'Louis', 'louis.lefevre@centrale-marseille.fr', '0690123457', 'Homme', 'Nuit',
         ['Surveillance publique', 'Gestion conflits', 'Service au bar']),

        ('Rousseau', 'Zoé', 'zoe.rousseau@centrale-marseille.fr', '0601234568', 'Femme', 'Jour',
         ['Animation jeux', 'Animation micro', 'Service cuisine']),
    ]

    password_hash = hash_password('password123')

    with conn.cursor() as cur:
        # Récupérer l'id de Centrale Marseille
        cur.execute("SELECT id_ecole FROM ecole WHERE code_ecole = 'CMA'")
        id_ecole = cur.fetchone()[0]

        inserted_staff = []

        for nom, prenom, email, tel, genre, type_staff, competences in staffeurs:
            try:
                cur.execute("SAVEPOINT sp_staff")

                # Insérer/mettre à jour la personne (email unique)
                cur.execute(
                    """INSERT INTO personne (prenom, nom, email, mot_de_passe, telephone, genre,
                   statut, taille_tshirt, regime_alimentaire, id_ecole)
                   VALUES (%s, %s, %s, %s, %s, %s::genre_type, %s::personne_statut_type,
                   %s::taille_tshirt_type, %s, %s)
                   ON CONFLICT (email) DO UPDATE SET
                     prenom = EXCLUDED.prenom,
                     nom = EXCLUDED.nom,
                     mot_de_passe = EXCLUDED.mot_de_passe,
                     telephone = EXCLUDED.telephone,
                     genre = EXCLUDED.genre,
                     statut = EXCLUDED.statut,
                     taille_tshirt = EXCLUDED.taille_tshirt,
                     regime_alimentaire = EXCLUDED.regime_alimentaire,
                     id_ecole = EXCLUDED.id_ecole
                   RETURNING id_personne""",
                    (prenom, nom, email, password_hash, tel, genre, 'Staff',
                     'M' if genre == 'Homme' else 'S', 'Aucun', id_ecole)
                )
                id_personne = cur.fetchone()[0]

                # Insérer/mettre à jour le staffeur (id_personne unique)
                cur.execute(
                    """INSERT INTO staffeur (id_personne, type_staff, staff_autres_assos,
                   participation_pompims, preference_heures_max, contrainte_heures_consecutives_max)
                   VALUES (%s, %s::type_staff_type, %s, %s, %s, %s)
                   ON CONFLICT (id_personne) DO UPDATE SET
                     type_staff = EXCLUDED.type_staff,
                     staff_autres_assos = EXCLUDED.staff_autres_assos,
                     participation_pompims = EXCLUDED.participation_pompims,
                     preference_heures_max = EXCLUDED.preference_heures_max,
                     contrainte_heures_consecutives_max = EXCLUDED.contrainte_heures_consecutives_max
                   RETURNING id_staffeur""",
                    (id_personne, type_staff, False, False, 12, 4)
                )
                id_staffeur = cur.fetchone()[0]

                # Associer les compétences
                for comp_nom in competences:
                    if comp_nom in competences_ids:
                        cur.execute(
                            """INSERT INTO staffeur_competence (id_staffeur, id_competence)
                           VALUES (%s, %s)
                           ON CONFLICT (id_staffeur, id_competence) DO NOTHING""",
                            (id_staffeur, competences_ids[comp_nom])
                        )

                inserted_staff.append({
                    'id_staffeur': id_staffeur,
                    'nom': f"{prenom} {nom}",
                    'email': email
                })
                cur.execute("RELEASE SAVEPOINT sp_staff")

            except psycopg2.Error as e:
                cur.execute("ROLLBACK TO SAVEPOINT sp_staff")
                cur.execute("RELEASE SAVEPOINT sp_staff")
                print(f"   ⚠️ Staff ignoré ({email}) : {e.pgerror or str(e)}")
                continue

    conn.commit()
    print(
        f"   ✓ {len(inserted_staff)} staffeurs insérés/mis à jour avec leurs compétences")
    return inserted_staff


def remplir_disponibilites_staffeurs(conn, staffeurs, creneaux):
    """Remplit la table staffeur_disponibilite de façon cohérente selon le type de staff"""
    print("📆 Remplissage de la table STAFFEUR_DISPONIBILITE...")

    # Récupérer le type de staff pour chaque staffeur
    with conn.cursor() as cur:
        cur.execute("SELECT id_staffeur, type_staff FROM staffeur")
        type_par_staffeur = {
            id_staff: type_staff for id_staff, type_staff in cur.fetchall()}

    disponibilites = []

    for staff in staffeurs:
        id_staffeur = staff['id_staffeur']
        type_staff = type_par_staffeur.get(id_staffeur, 'Mixte')

        for id_creneau, _jour, heure_debut, _heure_fin in creneaux:
            heure = heure_debut.hour if hasattr(
                heure_debut, 'hour') else int(str(heure_debut).split(':')[0])

            # Règles cohérentes par profil
            if type_staff == 'Jour':
                est_dispo = 8 <= heure < 20
            elif type_staff == 'Nuit':
                est_dispo = (heure >= 18) or (heure < 9)
            else:  # Mixte
                est_dispo = True

            # Petite variabilité: indisponible 1 créneau sur 6 environ
            if est_dispo and ((id_staffeur + id_creneau) % 6 == 0):
                est_dispo = False

            if est_dispo:
                disponibilites.append((id_staffeur, id_creneau))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO staffeur_disponibilite (id_staffeur, id_creneau)
               VALUES (%s, %s)
               ON CONFLICT (id_staffeur, id_creneau) DO NOTHING""",
            disponibilites
        )

    conn.commit()
    print(f"   ✓ {len(disponibilites)} disponibilités staffeurs insérées")


def remplir_jobs(conn, competences_ids, pole_ids, creneaux):
    """Remplit la table job avec des jobs variés"""
    print("💼 Remplissage de la table JOB...")

    jobs = []

    # Jobs Bar (Pôle Soirée) - créneaux soirée/nuit
    jobs_bar = [
        ('Bar principal - Soir', 'Soirée',
         competences_ids['Service au bar'], 14, 17, 2, 3),
        ('Bar secondaire - Soir', 'Soirée',
         competences_ids['Service au bar'], 18, 21, 2, 3),
        ('Bar VIP - Nuit', 'Soirée',
         competences_ids['Préparation cocktails'], 21, 24, 1, 2),
    ]

    # Jobs Cuisine (Pôle Repas) - créneaux repas
    jobs_cuisine = [
        ('Préparation petit-déjeuner', 'Repas',
         competences_ids['Préparation sandwiches'], 1, 2, 2, 3),
        ('Service déjeuner', 'Repas',
         competences_ids['Service cuisine'], 3, 4, 3, 4),
        ('Grill soirée', 'Repas',
         competences_ids['Cuisson grill'], 18, 19, 2, 3),
    ]

    # Jobs Arbitrage (Pôle Tournoi) - créneaux matchs
    jobs_arbitrage = [
        ('Arbitrage Beach Volley Matin', 'Tournoi',
         competences_ids['Arbitrage Beach Volley'], 1, 3, 4, 6),
        ('Arbitrage Beach Volley AM', 'Tournoi',
         competences_ids['Arbitrage Beach Volley'], 4, 6, 4, 6),
        ('Arbitrage Beach Soccer Matin', 'Tournoi',
         competences_ids['Arbitrage Beach Soccer'], 1, 3, 3, 4),
        ('Arbitrage Basket', 'Tournoi',
         competences_ids['Arbitrage Basketball'], 4, 6, 2, 3),
    ]

    # Jobs Logistique (Pôle Logistique)
    jobs_logistique = [
        ('Montage structures jour 1', 'Logistique',
         competences_ids['Montage structures'], 0, 3, 4, 6),
        ('Transport matériel', 'Logistique',
         competences_ids['Transport matériel'], 1, 4, 2, 3),
        ('Rangement final', 'Logistique',
         competences_ids['Gestion stocks'], 16, 17, 3, 5),
    ]

    # Jobs Sécurité (Pôle Sécurité)
    jobs_securite = [
        ('Surveillance générale Jour', 'Sécurité',
         competences_ids['Surveillance publique'], 1, 6, 3, 4),
        ('Surveillance Nuit', 'Sécurité',
         competences_ids['Surveillance publique'], 21, 24, 2, 3),
        ('Poste secours', 'Sécurité', competences_ids['PSE1'], 1, 17, 2, 2),
    ]

    # Jobs Animation (Pôle Soirée)
    jobs_animation = [
        ('Animation micro tournoi', 'Soirée',
         competences_ids['Animation micro'], 1, 6, 1, 1),
        ('DJ Soirée', 'Soirée', competences_ids['DJ/Musique'], 18, 24, 1, 2),
        ('Animation jeux', 'Soirée',
         competences_ids['Animation jeux'], 18, 21, 2, 3),
    ]

    for nom_job, pole_nom, id_comp, creneau_debut, creneau_fin, nb_min, nb_max in jobs_bar + jobs_cuisine + jobs_arbitrage + jobs_logistique + jobs_securite + jobs_animation:
        for idx_creneau in range(creneau_debut, creneau_fin + 1):
            if idx_creneau < len(creneaux):
                id_creneau = creneaux[idx_creneau][0]
                jobs.append((
                    f"{nom_job} - {creneaux[idx_creneau][1]} {creneaux[idx_creneau][2]}",
                    pole_ids.get(pole_nom),
                    id_comp,
                    id_creneau,
                    nb_min,
                    nb_max,
                    f"Job pour {pole_nom}"
                ))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO job (nom_job, id_pole, id_competence_requise, id_creneau, 
               nb_staffeurs_min, nb_staffeurs_max, description) 
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            jobs
        )
    conn.commit()
    print(f"   ✓ {len(jobs)} jobs insérés")


def remplir_sports_et_terrains(conn):
    """Remplit les tables sport et terrain"""
    print("⚽ Remplissage des tables SPORT et TERRAIN...")

    sports = [
        ('Beach Volley', 6, 'Sable'),
        ('Beach Soccer', 10, 'Sable'),
        ('Basketball 3x3', 6, 'Bitume'),
        ('Rugby à 7', 14, 'Herbe'),
    ]

    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO sport (nom_sport, nb_joueurs_equipe, type_terrain) VALUES (%s, %s, %s)",
            sports
        )

    # Terrains
    terrains = []
    for i in range(1, 7):
        terrains.append((f'Terrain Volley {i}', 'Sable', 'Disponible'))
    for i in range(1, 4):
        terrains.append((f'Terrain Soccer {i}', 'Sable', 'Disponible'))
    for i in range(1, 3):
        terrains.append((f'Terrain Basket {i}', 'Bitume', 'Disponible'))

    with conn.cursor() as cur:
        cur.executemany(
            "INSERT INTO terrain (nom_terrain, type_terrain, statut) VALUES (%s, %s, %s::terrain_statut_type)",
            terrains
        )

    conn.commit()
    print(f"   ✓ {len(sports)} sports et {len(terrains)} terrains insérés")


def main():
    """Fonction principale"""
    print("\n" + "="*60)
    print("🏖️  REMPLISSAGE BASE DE DONNÉES MSB")
    print("="*60 + "\n")

    try:
        conn = get_connection()
        print("✓ Connexion à la base de données établie\n")

        # Remplissage dans l'ordre des dépendances
        remplir_ecoles(conn)
        competences_ids = remplir_competences(conn)
        creneaux = remplir_creneaux(conn)
        pole_ids = remplir_poles_msb(conn)
        staffeurs = remplir_staffeurs(conn, competences_ids, pole_ids)
        remplir_disponibilites_staffeurs(conn, staffeurs, creneaux)
        remplir_jobs(conn, competences_ids, pole_ids, creneaux)
        remplir_sports_et_terrains(conn)

        print("\n" + "="*60)
        print("✅ REMPLISSAGE TERMINÉ AVEC SUCCÈS")
        print("="*60)
        print(f"\n📊 Résumé:")
        print(f"   • 8 écoles")
        print(f"   • {len(competences_ids)} compétences")
        print(f"   • {len(creneaux)} créneaux")
        print(f"   • {len(pole_ids)} pôles MSB")
        print(f"   • 20 staffeurs")
        print(f"   • Jobs créés pour tous les créneaux")
        print(f"   • 4 sports et 11 terrains")
        print("\n🔑 Identifiants de connexion:")
        print("   Email: [email des staffeurs]@centrale-marseille.fr")
        print("   Mot de passe: password123")
        print("\n")

        conn.close()

    except psycopg2.Error as e:
        print(f"\n❌ Erreur de base de données: {e}")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")


if __name__ == "__main__":
    main()
