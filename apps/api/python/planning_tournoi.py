from collections import defaultdict


# génère les matchs d'une poule en round-robin
def _generer_matchs_poule(id_equipes):

    matchs = []
    for i in range(len(id_equipes)):
        for j in range(i + 1, len(id_equipes)):
            matchs.append((id_equipes[i], id_equipes[j]))
    return matchs


# Input : poules + créneaux + terrains disponibles
# Output :  matchs planifiés (à insérer dans la table MATCH)
def generer_planning_tournoi(poules, creneaux, terrains):

    # on génère tous les matchs à placer pour toutes les poules
    matchs_a_placer = []

    for poule in poules:
        paires = _generer_matchs_poule(poule["equipes"])
        for equipe1, equipe2 in paires:
            matchs_a_placer.append({
                "id_sport": poule["id_sport"],
                "nom_poule": poule["nom_poule"],
                "equipe1": equipe1,
                "equipe2": equipe2
            })

    matchs_planifies = []

    # pour éviter qu'une équipe joue deux créneaux d'affilée
    dernier_creneau_equipe = {}  

    # ids des terrains disponibles
    ids_terrains = [t["id_terrain"] for t in terrains]

    for creneau in creneaux:
        id_creneau = creneau["id_creneau"]
        terrains_libres = list(ids_terrains)
        equipes_occupees = set()  # équipes qui jouent déjà sur ce créneau
        matchs_restants = []

        idx_actuel = creneaux.index(creneau)
        id_creneau_precedent = creneaux[idx_actuel - 1]["id_creneau"] if idx_actuel > 0 else None

        for match in matchs_a_placer:
            e1 = match["equipe1"]
            e2 = match["equipe2"]

            # plus de terrain dispo sur ce créneau, on reporte
            if not terrains_libres:
                matchs_restants.append(match)
                continue

            # une des deux équipes joue déjà sur ce créneau
            if e1 in equipes_occupees or e2 in equipes_occupees:
                matchs_restants.append(match)
                continue

            # vérifier que les deux équipes n'ont pas joué au créneau juste avant
            if dernier_creneau_equipe.get(e1) == id_creneau_precedent or \
               dernier_creneau_equipe.get(e2) == id_creneau_precedent:
                matchs_restants.append(match)
                continue

            # on assigne un terrain et on planifie le match
            id_terrain = terrains_libres.pop(0)

            matchs_planifies.append({
                "id_sport": match["id_sport"],
                "nom_poule": match["nom_poule"],
                "id_creneau": id_creneau,
                "id_terrain": id_terrain,
                "id_equipe1": e1,
                "id_equipe2": e2,
                "score_equipe1": None,
                "score_equipe2": None
            })

            equipes_occupees.add(e1)
            equipes_occupees.add(e2)
            dernier_creneau_equipe[e1] = id_creneau
            dernier_creneau_equipe[e2] = id_creneau

        matchs_a_placer = matchs_restants

    # si des matchs n'ont pas pu être placés on les signale
    if matchs_a_placer:
        print(f"attention : {len(matchs_a_placer)} match(s) n'ont pas pu etre places, pas assez de creneaux ou de terrains")

    return matchs_planifies


# test local (Balsam)
if __name__ == "__main__":

    # des poules comme creer_poules les retourne
    poules = [
        {
            "id_sport": 10,
            "niveau": "Championship",
            "categorie": "Feminin",
            "nom_poule": "Poule A",
            "equipes": [1, 3, 5, 7]
        },
        {
            "id_sport": 10,
            "niveau": "Championship",
            "categorie": "Feminin",
            "nom_poule": "Poule B",
            "equipes": [2, 4, 6, 8]
        },
    ]

    # créneaux qui viennent de la BDD, ordonnés chronologiquement
    creneaux = [
        {"id_creneau": 1, "jour": "Vendredi", "heure_debut": "09:00", "heure_fin": "09:20"},
        {"id_creneau": 2, "jour": "Vendredi", "heure_debut": "09:30", "heure_fin": "09:50"},
        {"id_creneau": 3, "jour": "Vendredi", "heure_debut": "10:00", "heure_fin": "10:20"},
        {"id_creneau": 4, "jour": "Vendredi", "heure_debut": "10:30", "heure_fin": "10:50"},
        {"id_creneau": 5, "jour": "Vendredi", "heure_debut": "11:00", "heure_fin": "11:20"},
        {"id_creneau": 6, "jour": "Vendredi", "heure_debut": "11:30", "heure_fin": "11:50"},
        {"id_creneau": 7, "jour": "Samedi",   "heure_debut": "09:00", "heure_fin": "09:20"},
        {"id_creneau": 8, "jour": "Samedi",   "heure_debut": "09:30", "heure_fin": "09:50"},
    ]

    # terrains qui viennent de la BDD
    terrains = [
        {"id_terrain": 1, "nom_terrain": "Terrain 1", "type_terrain": "volley"},
        {"id_terrain": 2, "nom_terrain": "Terrain 2", "type_terrain": "volley"},
        {"id_terrain": 3, "nom_terrain": "Terrain 3", "type_terrain": "volley"},
    ]

    # noms pour rendre le test lisible
    noms_equipes = {1: "Centrale_1", 2: "Centrale_2", 3: "Polytech_1", 4: "Polytech_2",
                    5: "Mines_1", 6: "Mines_2", 7: "INSA_1", 8: "INSA_2"}
    noms_creneaux = {c["id_creneau"]: f"{c['jour']} {c['heure_debut']}" for c in creneaux}
    noms_terrains = {t["id_terrain"]: t["nom_terrain"] for t in terrains}

    planning = generer_planning_tournoi(poules, creneaux, terrains)

    print(f"planning genere : {len(planning)} matchs\n")

    # affichage groupé par créneau
    par_creneau = defaultdict(list)
    for m in planning:
        par_creneau[m["id_creneau"]].append(m)

    for id_creneau, matchs in par_creneau.items():
        print(f"{noms_creneaux[id_creneau]} :")
        for m in matchs:
            e1 = noms_equipes.get(m["id_equipe1"], str(m["id_equipe1"]))
            e2 = noms_equipes.get(m["id_equipe2"], str(m["id_equipe2"]))
            terrain = noms_terrains.get(m["id_terrain"], str(m["id_terrain"]))
            print(f"  {terrain} | {m['nom_poule']} | {e1} vs {e2}")
        print()