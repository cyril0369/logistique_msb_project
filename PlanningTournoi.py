from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from collections import defaultdict

class PlanningTournoi:
   
    def __init__(self, sport: str, poules: List[List[Dict]], #les paramétres sont à demander à l'ut ?
                 nb_terrains: int, duree_match_min: int = 20,
                 temps_pause_min: int = 10): 

        self.sport = sport
        self.poules = poules
        self.nb_terrains = nb_terrains
        self.duree_match = duree_match_min
        self.temps_pause = temps_pause_min
        
    def generer_matchs_poule(self, poule: List[Dict]) -> List[Tuple[str, str]]:
        n = len(poule)
        matchs = []
        
        for i in range(n):
            for j in range(i + 1, n):
                matchs.append((poule[i]["nom"], poule[j]["nom"]))
        
        return matchs
    
    def generer_tous_matchs(self) -> Dict[int, List[Tuple[str, str]]]:
        tous_matchs = {}
        
        for i, poule in enumerate(self.poules, start=1):
            tous_matchs[i] = self.generer_matchs_poule(poule)
        
        return tous_matchs
    
    def creer_planning(self, heure_debut: str = "09:00") -> List[Dict]:
    
        tous_matchs = self.generer_tous_matchs()
        
        # Aplatir la liste de matchs avec info de poule
        matchs_a_placer = []
        for num_poule, matchs in tous_matchs.items():
            for match in matchs:
                matchs_a_placer.append((match[0], match[1], num_poule))
        
        # Planning final
        planning = []
        creneau_actuel = 0
        heure_actuelle = datetime.strptime(heure_debut, "%H:%M")
        
        # Tracker pour éviter qu'une équipe joue 2 fois de suite
        dernier_creneau = {}  # equipe -> dernier créneau joué
        
        while matchs_a_placer:
            matchs_creneau = []
            terrain = 1
            matchs_restants = []
            
            for equipe1, equipe2, poule in matchs_a_placer:
                # Vérifier si les équipes peuvent jouer (pas joué au créneau précédent)
                peut_jouer = True
                
                if equipe1 in dernier_creneau and dernier_creneau[equipe1] == creneau_actuel - 1:
                    peut_jouer = False
                if equipe2 in dernier_creneau and dernier_creneau[equipe2] == creneau_actuel - 1:
                    peut_jouer = False
                
                # Si on peut jouer et qu'il reste des terrains
                if peut_jouer and terrain <= self.nb_terrains:
                    matchs_creneau.append((equipe1, equipe2, terrain, poule))
                    dernier_creneau[equipe1] = creneau_actuel
                    dernier_creneau[equipe2] = creneau_actuel
                    terrain += 1
                else:
                    matchs_restants.append((equipe1, equipe2, poule))
            
            # Si on a placé des matchs dans ce créneau
            if matchs_creneau:
                heure_fin = heure_actuelle + timedelta(minutes=self.duree_match)
                
                planning.append({
                    'creneau': creneau_actuel + 1,
                    'heure_debut': heure_actuelle.strftime("%H:%M"),
                    'heure_fin': heure_fin.strftime("%H:%M"),
                    'matchs': matchs_creneau
                })
                
                heure_actuelle = heure_fin + timedelta(minutes=self.temps_pause)
                creneau_actuel += 1
            
            matchs_a_placer = matchs_restants
            
            # Sécu : si aucun match placé, forcer le placement
            if not matchs_creneau and matchs_a_placer:
                # Placer au moins un match pour éviter boucle infinie
                equipe1, equipe2, poule = matchs_a_placer.pop(0)
                heure_fin = heure_actuelle + timedelta(minutes=self.duree_match)
                
                planning.append({
                    'creneau': creneau_actuel + 1,
                    'heure_debut': heure_actuelle.strftime("%H:%M"),
                    'heure_fin': heure_fin.strftime("%H:%M"),
                    'matchs': [(equipe1, equipe2, 1, poule)]
                })
                
                dernier_creneau[equipe1] = creneau_actuel
                dernier_creneau[equipe2] = creneau_actuel
                heure_actuelle = heure_fin + timedelta(minutes=self.temps_pause)
                creneau_actuel += 1
        
        return planning
    
    def afficher_planning(self, planning: List[Dict]):
        print(f"PLANNING TOURNOI - {self.sport.upper()}")
        print(f"Terrains disponibles: {self.nb_terrains} | Durée match: {self.duree_match}min")
        
        for creneau in planning:
            print(f"Créneau {creneau['creneau']}: {creneau['heure_debut']} - {creneau['heure_fin']}")
            for equipe1, equipe2, terrain, poule in creneau['matchs']:
                print(f" Terrain {terrain} (Poule {poule}): {equipe1:15} vs {equipe2:15}")
            print()
    
    def statistiques_planning(self, planning: List[Dict]) -> Dict:

        total_matchs = sum(len(c['matchs']) for c in planning)
        total_creneaux = len(planning)
        
        # Taux d'occupation des terrains
        creneaux_terrain = total_creneaux * self.nb_terrains
        taux_occupation = (total_matchs / creneaux_terrain * 100) if creneaux_terrain > 0 else 0
        
        # Durée totale
        if planning:
            debut = datetime.strptime(planning[0]['heure_debut'], "%H:%M")
            fin = datetime.strptime(planning[-1]['heure_fin'], "%H:%M")
            duree_totale = (fin - debut).total_seconds() / 60
        else:
            duree_totale = 0
        
        return {
            'total_matchs': total_matchs,
            'total_creneaux': total_creneaux,
            'taux_occupation_terrains': round(taux_occupation, 1),
            'duree_totale_min': int(duree_totale)
        }


# Paramétrage
DUREES_MATCHS = {
    "Volley": 20,
    "Football": 25
}

#Test
if __name__ == "__main__":
    # Exemple avec les poules créées précédemment
    poules_volley = [
        [
        {"nom": "Centrale_1", "ecole": "Centrale", "sport": "Volley"},
        {"nom": "Centrale_2", "ecole": "Centrale", "sport": "Volley"},
        {"nom": "polytech_1", "ecole": "polytech", "sport": "Volley"},
        ],
        [
            {"nom": "polytech_1", "ecole": "polytech", "sport": "Volley"},
        ]
    ]
    
    # Créer le planning
    planner = PlanningTournoi(
        sport="Volley",
        poules=poules_volley,
        nb_terrains=3,
        duree_match_min=20,
        temps_pause_min=5
    )
    
    planning = planner.creer_planning(heure_debut="09:00") #à rectifier/à demander à l'utilisateur
    planner.afficher_planning(planning)
    
    # Afficher les stats
    stats = planner.statistiques_planning(planning)
    print("\nSTATISTIQUES")
    print(f"   Total matchs: {stats['total_matchs']}")
    print(f"   Créneaux nécessaires: {stats['total_creneaux']}")
    print(f"   Taux occupation terrains: {stats['taux_occupation_terrains']}%")
    print(f"   Durée totale: {stats['duree_totale_min']}min ({stats['duree_totale_min']//60}h{stats['duree_totale_min']%60:02d})")