import sqlite3
from Poules import creer_poules, afficher_poules


def get_equipes_from_db(db_path: str = "database.db"):
    """Récupère les équipes depuis la base de données."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Requête pour récupérer les équipes avec leur école et leur sport
    query = """
    SELECT e.id_equipe, e.nom_equipe, ec.nom AS ecole, s.nom_sport AS sport
    FROM equipe e
    JOIN ecole ec ON e.id_ecole = ec.id_ecole
    JOIN sport s ON e.id_sport = s.id_sport
    """
    cursor.execute(query)
    rows = cursor.fetchall()

    # Formater les résultats en liste de dictionnaires
    equipes = []
    for row in rows:
        equipe = {
            "nom": row[1],
            "ecole": row[2],
            "sport": row[3]
        }
        equipes.append(equipe)

    conn.close()
    return equipes


if __name__ == "__main__":

    # Récupérer les équipes depuis la base de données
    equipes = get_equipes_from_db()

    print("CRÉATION DES POULES MSB")
    print()

    # Créer les poules avec max_par_poule
    poules = creer_poules(equipes, max_par_poule=3)

    # Afficher les résultats
    afficher_poules(poules)

    # Afficher les statistiques
    print("\n\nSTATISTIQUES")
    for sport, liste_poules in poules.items():
        nb_equipes = sum(len(p) for p in liste_poules)
        tailles = [len(p) for p in liste_poules]
        print(f"\n{sport}:")
        print(f"  - Total équipes: {nb_equipes}")
        print(f"  - Nombre de poules: {len(liste_poules)}")
        print(f"  - Tailles des poules: {tailles}")
