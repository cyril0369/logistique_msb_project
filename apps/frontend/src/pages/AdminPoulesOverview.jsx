import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import "./admin.css";

export default function AdminPoulesOverview() {
  const [sports, setSports] = useState([]);
  const [err, setErr] = useState("");

  const loadSports = () => {
    setErr("");
    api
      .get("/api/admin/poules/sports")
      .then((res) => setSports((res.data || []).filter((s) => Number(s.poules_count) > 0)))
      .catch((error) => setErr(error?.response?.data || "Erreur réseau"));
  };

  useEffect(() => {
    loadSports();
  }, []);

  return (
    <AdminLayout title="Poules du Tournoi" subtitle="Visualisation des poules, sport par sport">
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <Link className="admin-nav-link" to="/admin/scripts">Retour scripts</Link>
        <button className="admin-btn" onClick={loadSports}>Actualiser</button>
      </div>
      {err ? <div className="admin-alert admin-alert-err">{err}</div> : null}
      <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {sports.length === 0 ? <p>Aucune poule générée pour le moment.</p> : null}
        {sports.map((sport) => (
          <article key={sport.id_sport} className="admin-card">
            <h3 style={{ marginTop: 0 }}>{sport.nom_sport}</h3>
            <p>Poules: <strong>{sport.poules_count}</strong></p>
            <p>Équipes: <strong>{sport.equipes_count}</strong></p>
            <Link className="admin-nav-link" to={`/admin/poules/${sport.id_sport}`}>Voir les poules</Link>
          </article>
        ))}
      </div>
    </AdminLayout>
  );
}
