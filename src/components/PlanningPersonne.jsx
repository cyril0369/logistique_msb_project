import edtData from '../data/edt.json';
import { useEffect } from 'react';

export default function PlanningPersonne() {
    console.log(edtData);

    useEffect(() => {
        const container = document.getElementById("vendredi");

        // plage horaire affichée
        const heureDebut = 8;
        const heureFin = 18;

        // création d'une map des heures occupées
        const heuresOccupees = {};

        // remplir les heures occupées à partir du JSON
        for (const tache in edtData.vendredi) {
        const debut = parseInt(edtData.vendredi[tache].heure_debut);
        const fin = parseInt(edtData.vendredi[tache].heure_fin);

        for (let h = debut; h < fin; h++) {
            heuresOccupees[h] = tache;
        }
        }

        // créer les cases
        for (let h = heureDebut; h < heureFin; h++) {
        const div = document.createElement("div");
        div.className = "heure";

        if (heuresOccupees[h]) {
            div.textContent = `${h}h - ${h+1}h : ${heuresOccupees[h]}`;
            div.style.backgroundColor = "#cce5ff";
        } else {
            div.textContent = `${h}h - ${h+1}h`;
        }

        container.appendChild(div);
        }
    }, []);
  
  return (
    <div className="planning-personne">
        <h1>Mon Planning</h1>
        <div className="journee">
            <h2>Vendredi</h2>
            <div id="vendredi"></div>
        </div>
    </div>

  );
}