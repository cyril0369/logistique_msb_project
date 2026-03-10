import { useEffect, useState } from "react";
import Desktop from "../components/desktop";
import api from "../services/api";

export default function Profil() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setError("");
      try {
        const res = await api.get("/api/me");
        setProfile(res.data);
      } catch (err) {
        setError("Impossible de charger le profil.");
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="Page">
      <Desktop />
      <main className="admin-main">
        <div className="admin-shell">
          <div className="admin-content">
            <div className="titre-sous-titre block" style={{ alignItems: "flex-start", marginBottom: 12 }}>
              <h1>Mon profil</h1>
              <p className="sous-titre-1" style={{ color: "var(--GRIS_FONCE)" }}>
                Informations issues de l'API utilisateur
              </p>
            </div>

            {error ? <div className="admin-alert admin-alert-err">{error}</div> : null}

            {!profile && !error ? <p className="corps-1">Chargement...</p> : null}

            {profile ? (
              <div className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                <div className="admin-card">
                  <h3>Statut</h3>
                  <p className="corps-1"><strong>Role:</strong> {profile.role || "Participant"}</p>
                  <p className="corps-1"><strong>Admin:</strong> {profile.is_admin ? "Oui" : "Non"}</p>
                  <p className="corps-1"><strong>Staff:</strong> {profile.is_staff ? "Oui" : "Non"}</p>
                </div>

                <div className="admin-card">
                  <h3>Identite</h3>
                  <p className="corps-1"><strong>Prenom:</strong> {profile.first_name || "-"}</p>
                  <p className="corps-1"><strong>Nom:</strong> {profile.last_name || "-"}</p>
                  <p className="corps-1"><strong>Username:</strong> {profile.username || "-"}</p>
                  <p className="corps-1"><strong>Email:</strong> {profile.email || "-"}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
