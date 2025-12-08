from typing import List, Dict, Set
from datetime import datetime, timedelta
from collections import defaultdict

class PlanningStaff:

    def __init__(self, max_heures_consecutives: int = 4):
        self.max_heures_consecutives = max_heures_consecutives # à vérifier avec l'équipe
        self.planning = []
    
    def creer_planning_staff(
        self,
        staffeurs: List[Dict],
        taches: List[Dict],
        creneaux: List[str]
    ) -> Dict:
 
        affectations = []
        
        # Grouper les tâches /créneau
        taches_par_creneau = defaultdict(list)
        for tache in taches:
            taches_par_creneau[tache['creneau']].append(tache)
        
        # Tracker du nombre d'heures par staff
        heures_staff = {s['nom']: 0 for s in staffeurs}
        creneaux_staff = {s['nom']: [] for s in staffeurs}
        
        # Pour chaque créneau, affecter les staffeurs
        for creneau in creneaux:
            taches_creneau = taches_par_creneau.get(creneau, [])
            
            for tache in taches_creneau:
                # Trouver les staffeurs disponibles pour cette tâche
                candidats = []
                
                for staff in staffeurs:
                    # Vérif
                    if creneau not in staff.get('dispos', []):
                        continue
                    
                    if staff['pole'] != tache['pole']:
                        continue
                    
                    # Vérif heures max
                    if heures_staff[staff['nom']] >= staff.get('pref_heures', 8):
                        continue
                    
                    # Vérif heures consécutives
                    nb_consecutives = self._compter_heures_consecutives(
                        creneaux_staff[staff['nom']], 
                        creneau,
                        creneaux
                    )
                    
                    if nb_consecutives >= self.max_heures_consecutives:
                        continue
                    
                    candidats.append(staff)
                
                # prioriser ceux avec moins d'heures, trie
                candidats.sort(key=lambda s: heures_staff[s['nom']])
                
                # Affecter les N premiers N = nb_staff_min
                nb_a_affecter = min(tache['nb_staff_min'], len(candidats))
                
                for i in range(nb_a_affecter):
                    staff = candidats[i]
                    affectations.append({
                        'staff': staff['nom'],
                        'pole': staff['pole'],
                        'tache': tache['nom'],
                        'creneau': creneau
                    })
                    
                    heures_staff[staff['nom']] += 1
                    creneaux_staff[staff['nom']].append(creneau)
        
        # Calculer les stats
        stats = self._calculer_stats(affectations, staffeurs, taches)
        
        return {
            'affectations': affectations,
            'stats': stats
        }
    
    def _compter_heures_consecutives(
        self, 
        creneaux_staff: List[str], 
        nouveau_creneau: str,
        tous_creneaux: List[str]
    ) -> int:
    
        if not creneaux_staff:
            return 1
        
        # Trouver l'index du nouveau créneau
        try:
            idx_nouveau = tous_creneaux.index(nouveau_creneau)
        except ValueError:
            return 1
        
        # Compter en arrière
        consecutives = 1
        for i in range(idx_nouveau - 1, -1, -1):
            if tous_creneaux[i] in creneaux_staff:
                consecutives += 1
            else:
                break
        
        return consecutives
    
    def _calculer_stats(
        self, 
        affectations: List[Dict], 
        staffeurs: List[Dict],
        taches: List[Dict]
    ) -> Dict:
     
        # Heures par staff
        heures_par_staff = defaultdict(int)
        for aff in affectations:
            heures_par_staff[aff['staff']] += 1
        
        # Taux de couverture des tâches
        taches_couvertes = defaultdict(int)
        for aff in affectations:
            key = f"{aff['tache']}_{aff['creneau']}"
            taches_couvertes[key] += 1
        
        total_besoins = sum(t['nb_staff_min'] for t in taches)
        total_affectes = len(affectations)
        taux_couverture = (total_affectes / total_besoins * 100) if total_besoins > 0 else 0
        
        return {
            'total_affectations': len(affectations),
            'taux_couverture': round(taux_couverture, 1),
            'heures_par_staff': dict(heures_par_staff),
            'moyenne_heures': round(sum(heures_par_staff.values()) / len(staffeurs), 1) if staffeurs else 0
        }
    
    def afficher_planning(self, resultat: Dict):
        affectations = resultat['affectations']
        stats = resultat['stats']
        
        print(f"PLANNING STAFFEURS")
        
        # Grouper par créneau
        par_creneau = defaultdict(list)
        for aff in affectations:
            par_creneau[aff['creneau']].append(aff)
        
        for creneau in sorted(par_creneau.keys()):
            print(f"{creneau}")
            
            # Grouper par tâche
            par_tache = defaultdict(list)
            for aff in par_creneau[creneau]:
                par_tache[aff['tache']].append(aff['staff'])
            
            for tache, staffs in par_tache.items():
                print(f"    {tache:20} → {', '.join(staffs)}")
            print()
        
        # Afficher les stats
        print("\nSTATISTIQUES")
        print(f"   Total affectations: {stats['total_affectations']}")
        print(f"   Taux de couverture: {stats['taux_couverture']}%")
        print(f"   Moyenne heures/staff: {stats['moyenne_heures']}h")
        
        print("\n HEURES PAR STAFF:")
        for staff, heures in sorted(stats['heures_par_staff'].items()):
            print(f"   {staff:20} : {heures}h")


# TEST 
if __name__ == "__main__":
    # Exemple 
    creneaux = [
        "09:00-10:00",
        "10:00-11:00", 
        "11:00-12:00",
        "14:00-15:00",
        "15:00-16:00",
        "16:00-17:00"
    ]
    
    staffeurs = [
        {
            "nom": "Balsam",
            "pole": "Arbitrage",
            "dispos": ["09:00-10:00", "10:00-11:00", "11:00-12:00", "14:00-15:00"],
            "pref_heures": 4
        },
        {
            "nom": "Margaux",
            "pole": "Arbitrage",
            "dispos": ["10:00-11:00", "11:00-12:00", "14:00-15:00", "15:00-16:00"],
            "pref_heures": 3
        },
        {
            "nom": "piére",
            "pole": "Logistique",
            "dispos": ["09:00-10:00", "10:00-11:00", "15:00-16:00", "16:00-17:00"],
            "pref_heures": 4
        },
        {
            "nom": "Cyril",
            "pole": "Logistique",
            "dispos": ["11:00-12:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"],
            "pref_heures": 4
        },
        {
            "nom": "François",
            "pole": "Repas",
            "dispos": ["11:00-12:00", "14:00-15:00"],
            "pref_heures": 2
        }
    ]
    
    taches = [
        {"nom": "Arbitrage Terrain 1", "pole": "Arbitrage", "creneau": "09:00-10:00", "nb_staff_min": 2},
        {"nom": "Arbitrage Terrain 1", "pole": "Arbitrage", "creneau": "10:00-11:00", "nb_staff_min": 2},
        {"nom": "Installation matériel", "pole": "Logistique", "creneau": "09:00-10:00", "nb_staff_min": 2},
        {"nom": "Gestion stock", "pole": "Logistique", "creneau": "10:00-11:00", "nb_staff_min": 1},
        {"nom": "Service déjeuner", "pole": "Repas", "creneau": "11:00-12:00", "nb_staff_min": 1},
        {"nom": "Arbitrage Terrain 2", "pole": "Arbitrage", "creneau": "14:00-15:00", "nb_staff_min": 2},
        {"nom": "Rangement", "pole": "Logistique", "creneau": "16:00-17:00", "nb_staff_min": 2}
    ]
    
    # Créer le planning
    planner = PlanningStaff(max_heures_consecutives=3)
    resultat = planner.creer_planning_staff(staffeurs, taches, creneaux)
    
    # Afficher
    planner.afficher_planning(resultat)