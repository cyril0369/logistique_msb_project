from collections import defaultdict


def _index_to_letters(index):
    # 0 -> A, 25 -> Z, 26 -> AA, etc.
    letters = []
    n = index
    while True:
        n, rem = divmod(n, 26)
        letters.append(chr(65 + rem))
        if n == 0:
            break
        n -= 1
    return "".join(reversed(letters))


# regroupe les équipes selon sport + niveau + catégorie
# max_par_poule : configurable
def creer_poules(equipes, max_par_poule=4):

    # regrouper les équipes
    groupes = defaultdict(list)

    for equipe in equipes:
        cle = (equipe["id_sport"], equipe["niveau"], equipe["categorie"])
        groupes[cle].append(equipe)

    poules = []
    sport_poule_index = defaultdict(int)

    for (id_sport, niveau, categorie), eqs in sorted(groupes.items()):
        nb_equipes = len(eqs)

        # calcul du nombre de poules nécessaires
        nb_poules = (nb_equipes + max_par_poule - 1) // max_par_poule

        # initialiser les poules vides
        poules_groupe = [[] for _ in range(nb_poules)]

        # répartition équilibrée : distribution les équipes une par une
        for i, equipe in enumerate(eqs):
            poules_groupe[i % nb_poules].append(equipe)

        # formater chaque poule (pour aller en BDD)
        for equipes_poule in poules_groupe:
            label = _index_to_letters(sport_poule_index[id_sport])
            sport_poule_index[id_sport] += 1
            poules.append({
                "id_sport": id_sport,
                "niveau": niveau,
                "categorie": categorie,
                "nom_poule": f"Poule {label}",
                "equipes": [e["id_equipe"] for e in equipes_poule]
            })

    return poules


# test local (Balsam)
if __name__ == "__main__":

    equipes = [
        {"id_equipe": 1, "nom": "Centrale_1", "id_sport": 10, "niveau": "Championship", "categorie": "Feminin"},
        {"id_equipe": 2, "nom": "Centrale_2", "id_sport": 10, "niveau": "Championship", "categorie": "Feminin"},
        {"id_equipe": 3, "nom": "Polytech_1", "id_sport": 10, "niveau": "Championship", "categorie": "Feminin"},
        {"id_equipe": 4, "nom": "Polytech_2", "id_sport": 10, "niveau": "Championship", "categorie": "Feminin"},
        {"id_equipe": 5, "nom": "Mines_1",    "id_sport": 10, "niveau": "Championship", "categorie": "Feminin"},
        {"id_equipe": 6, "nom": "Mines_2",    "id_sport": 10, "niveau": "Championship", "categorie": "Feminin"},
        {"id_equipe": 7, "nom": "INSA_1",     "id_sport": 10, "niveau": "Championship", "categorie": "Feminin"},
        {"id_equipe": 8, "nom": "INSA_2",     "id_sport": 10, "niveau": "Championship", "categorie": "Feminin"},
        {"id_equipe": 9,  "nom": "Centrale_3", "id_sport": 10, "niveau": "Loisir", "categorie": "Mixte"},
        {"id_equipe": 10, "nom": "Polytech_3", "id_sport": 10, "niveau": "Loisir", "categorie": "Mixte"},
        {"id_equipe": 11, "nom": "Mines_3",    "id_sport": 11, "niveau": "Championship", "categorie": "Masculin"},
        {"id_equipe": 12, "nom": "INSA_3",     "id_sport": 11, "niveau": "Championship", "categorie": "Masculin"},
    ]

    # noms pour rendre le test lisible
    noms_sports = {10: "Beach Volley", 11: "Beach Soccer"}

    poules = creer_poules(equipes, max_par_poule=4)

    print("poules generees :")
    for p in poules:
        sport = noms_sports.get(p["id_sport"], str(p["id_sport"]))
        print(f"\n  {p['nom_poule']} | {sport} | {p['niveau']} | {p['categorie']}")
        print(f"  equipes (ids) : {p['equipes']}")

    print(f"\ntotal poules : {len(poules)}")
