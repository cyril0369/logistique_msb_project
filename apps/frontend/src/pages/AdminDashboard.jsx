import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import "./admin.css";

const quickActions = [
  { to: "/users", title: "Utilisateurs", desc: "Voir, contrôler et supprimer des comptes" },
  { to: "/order_detail", title: "Commandes", desc: "Consulter le détail des commandes goodies" },
  { to: "/jobs", title: "Jobs Staff", desc: "Créer des créneaux et affecter le staff" },
  { to: "/admin/scripts", title: "Scripts Planning", desc: "Exécuter les scripts tournoi/planning" },
  { to: "/admin/poules", title: "Poules", desc: "Explorer les poules par sport" },
];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSummary();
  }, []);

  function loadSummary() {
    setError("");
    api
      .get("/api/orders/summary")
      .then((res) => setSummary(res.data))
      .catch((err) => {
        setError(err?.response?.data?.error || err?.message || "Erreur réseau");
      });
  }

  const bars = useMemo(() => {
    if (!summary) return [];
    const values = [
      Number(summary.tshirts || 0),
      Number(summary.bobs || 0),
      Number(summary.shorts || 0),
      Number(summary.maillots || 0),
      Number(summary.gourdes || summary.gourds || 0),
    ];
    const max = Math.max(1, ...values);
    return [
      { label: "T-shirts", value: values[0], color: "#3A798D", pct: (values[0] / max) * 100 },
      { label: "Bobs", value: values[1], color: "#50D4BC", pct: (values[1] / max) * 100 },
      { label: "Shorts", value: values[2], color: "#E16369", pct: (values[2] / max) * 100 },
      { label: "Maillots", value: values[3], color: "#7C9AC7", pct: (values[3] / max) * 100 },
      { label: "Gourdes", value: values[4], color: "#3D8B6F", pct: (values[4] / max) * 100 },
    ];
  }, [summary]);

  return (
    <AdminLayout
      title="Tableau de Bord Administrateur"
      subtitle="Gestion des utilisateurs, jobs et scripts planning"
    >
      {error ? <div className="admin-alert admin-alert-err">{error}</div> : null}
      <div className="admin-dashboard-grid">
        <div className="admin-card">
          <div className="admin-section-head">
            <h3>Actions rapides</h3>
          </div>
          <div className="admin-action-grid">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className="admin-action-card">
                <strong>{action.title}</strong>
                <span>{action.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-section-head">
            <h3>Totaux des commandes</h3>
            <button className="admin-outline-btn" onClick={loadSummary}>Actualiser</button>
          </div>

          {!summary ? (
            <p>Chargement...</p>
          ) : (
            <>
              <div className="admin-kpi-grid">
                {bars.map((bar) => (
                  <div className="admin-kpi-card" key={`kpi-${bar.label}`}>
                    <span>{bar.label}</span>
                    <strong>{bar.value}</strong>
                  </div>
                ))}
              </div>

              <div className="admin-bars">
                {bars.map((bar) => (
                  <div key={bar.label}>
                    <div className="admin-bar-row">
                      <strong>{bar.label}</strong>
                      <span>{bar.value}</span>
                    </div>
                    <div className="admin-track">
                      <div
                        className="admin-fill"
                        style={{ width: `${bar.pct}%`, background: bar.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
