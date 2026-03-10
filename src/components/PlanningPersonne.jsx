export default function PlanningPersonne({ day, taches = [] }) {

  const heureDebut = 8;
  const heureFin = 20;

  const heuresOccupees = {};

  for (const tache of taches) {
    const debut = parseInt(String(tache.heure_debut).split(':')[0], 10);
    const fin = parseInt(String(tache.heure_fin).split(':')[0], 10);

    for (let h = debut; h < fin; h++) {
      heuresOccupees[h] = tache.tache;
    }
  }

  return (
    <div className="planning-personne">
      <div className="journee">
        <h2>{day}</h2>

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
