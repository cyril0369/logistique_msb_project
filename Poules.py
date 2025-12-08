from typing import List, Dict

def creer_poules(equipes: List[Dict], max_par_poule: int = 2) -> Dict: #on demande le max à l'utilisateur ?
    # 1. Regrouper les équipes par sport
    sports = {}
    for e in equipes:
        sport = e["sport"]
        if sport not in sports:
            sports[sport] = []
        sports[sport].append(e)

    # 2. Créer les poules par sport
    resultats = {}
    
    for sport, eqs in sports.items():
        nb_equipes = len(eqs)
        
        # Calculer le nb_poules nécessaires
        nb_poules = (nb_equipes + max_par_poule - 1) // max_par_poule
        
        # Initialiser 
        poules = [[] for _ in range(nb_poules)]
        
        # 3. Répartir les éqs de manière équilibrée
        for i, equipe in enumerate(eqs):
            index_poule = i % nb_poules
            poules[index_poule].append(equipe)
        
        resultats[sport] = poules
    
    return resultats


def afficher_poules(poules: Dict):
    
    for sport, liste_poules in poules.items():
        print(f"SPORT : {sport.upper()}")
        
        for i, p in enumerate(liste_poules, start=1):
            print(f"\n  Poule {i} ({len(p)} équipes)")
            for e in p:
                print(f"    • {e['nom']:20} | École: {e['ecole']}")


#EXEMPLE 
if __name__ == "__main__":
    # test
    equipes = [
        {"nom": "Centrale_1", "ecole": "Centrale", "sport": "Volley"},
        {"nom": "Centrale_2", "ecole": "Centrale", "sport": "Volley"},
        {"nom": "polytech_1", "ecole": "polytech", "sport": "Volley"},
        {"nom": "polytech_2", "ecole": "polytech", "sport": "fottball"},
        {"nom": "Mines_1", "ecole": "Mines", "sport": "football"},
        {"nom": "Mines_2", "ecole": "Mines", "sport": "football"},
    ]
    
    print("CRÉATION DES POULES MSB")
    print()
    
    # Créer les poules avec max_par_poule 
    poules = creer_poules(equipes, max_par_poule=2)
    
    # Afficher les résultats
    afficher_poules(poules)
    
    # Afficher les stat (à voir avec le groupe)
    print("\n\nSTATISTIQUES")
    for sport, liste_poules in poules.items():
        nb_equipes = sum(len(p) for p in liste_poules)
        tailles = [len(p) for p in liste_poules]
        print(f"\n{sport}:")
        print(f"  - Total équipes: {nb_equipes}")
        print(f"  - Nombre de poules: {len(liste_poules)}")
        print(f"  - Tailles des poules: {tailles}")
    
