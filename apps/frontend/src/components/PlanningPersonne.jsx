export default function PlanningPersonne({ day, taches = [], heureDebut, heureFin }) {

  const heuresOccupees = {};

  for (const tache of taches) {
    const debut = parseInt(String(tache.heure_debut).split(':')[0], 10);
    const fin = parseInt(String(tache.heure_fin).split(':')[0], 10);

    for (let h = debut; h < fin; h++) {
      heuresOccupees[h] = tache.tache;
    }
  }

  let startH = heureDebut;
  let endH = heureFin;

  if (taches.length > 0) {
    const starts = taches.map((t) => parseInt(String(t.heure_debut).split(':')[0], 10));
    const ends = taches.map((t) => parseInt(String(t.heure_fin).split(':')[0], 10));
    if (startH === undefined) startH = Math.min(...starts);
    if (endH === undefined) endH = Math.max(...ends);
  } else {
    if (startH === undefined) startH = 8;
    if (endH === undefined) endH = 20;
  }

  return (
    <div className="planning-personne">
      <div className="journee">
        <h2>{day}</h2>

        <div className="planning">
          {Array.from({ length: endH - startH }, (_, i) => {
            const h = startH + i;
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
