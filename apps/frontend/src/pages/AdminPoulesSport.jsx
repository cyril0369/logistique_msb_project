import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import "./admin.css";

export default function AdminPoulesSport() {
  const { sportId } = useParams();
  const [payload, setPayload] = useState(null);
  const [err, setErr] = useState("");

  const loadSportPoules = useCallback(() => {
    setErr("");
    api
      .get(`/api/admin/poules/sport/${sportId}`)
      .then((res) => setPayload(res.data))
      .catch((error) => setErr(error?.response?.data || "Erreur réseau"));
  }, [sportId]);

  useEffect(() => {
    loadSportPoules();
  }, [loadSportPoules]);

  return (
    <AdminLayout title={payload ? `Poules - ${payload.sport?.nom_sport}` : "Poules"} subtitle="Résultat du script de création des poules">
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <Link className="admin-nav-link" to="/admin/poules">Tous les sports</Link>
        <button className="admin-btn" onClick={loadSportPoules}>Actualiser</button>
      </div>
      {err ? <div className="admin-alert admin-alert-err">{err}</div> : null}
      <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {payload && payload.poules?.length === 0 ? <p>Aucune poule pour ce sport.</p> : null}
        {payload?.poules?.map((poule) => (
          <article className="admin-card" key={poule.id_poule}>
            <h3 style={{ marginTop: 0 }}>{poule.nom_poule || `Poule #${poule.id_poule}`}</h3>
            <p>{poule.niveau || "Niveau n/a"} - {poule.categorie || "Catégorie n/a"}</p>
            <p><strong>{poule.equipes?.length || 0}</strong> équipe(s)</p>
            <div className="admin-grid">
              {(poule.equipes || []).length === 0 ? <p>Aucune équipe.</p> : null}
              {(poule.equipes || []).map((team, idx) => (
                <div className="admin-card" key={team.id_equipe || idx}>
                  {idx + 1}. {team.nom_equipe} {team.nb_joueurs ? `(${team.nb_joueurs} joueurs)` : ""}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </AdminLayout>
  );
}
