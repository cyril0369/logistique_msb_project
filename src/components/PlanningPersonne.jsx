import edtData from '../data/edt.json';

export default function PlanningPersonne({ day }) {

  const heureDebut = 8;
  const heureFin = 18;

  const heuresOccupees = {};

  if (edtData[day]) {
    for (const tache in edtData[day]) {
      const debut = parseInt(edtData[day][tache].heure_debut);
      const fin = parseInt(edtData[day][tache].heure_fin);

      for (let h = debut; h < fin; h++) {
        heuresOccupees[h] = tache;
      }
    }
  }

  return (
    <div className="planning-personne">
      <div className="journee">
        <h2>{day.charAt(0).toUpperCase() + day.slice(1)}</h2>

        <div className="planning">
          {Array.from({ length: heureFin - heureDebut }, (_, i) => {
            const h = heureDebut + i;
            const occupe = heuresOccupees[h];

            return (
                <div className='creneau' key={h}>
                    <div
                        className="heure"
                    >
                        {h}h
                    </div>
                    <div
                        className={`tache ${occupe ? 'occupe' : ''}`}
                    >
                        {occupe ? `${occupe}` : ''}
                    </div>
                </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
