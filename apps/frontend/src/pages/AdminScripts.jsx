import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import "./admin.css";

const scriptList = [
  { id: "creer_poules", title: "creer_poules.py", desc: "Génère les poules depuis les équipes." },
  { id: "planning_staff", title: "planning_staff.py", desc: "Calcule les affectations staff sur les jobs." },
  { id: "planning_tournoi", title: "planning_tournoi.py", desc: "Planifie les matchs tournoi par créneau/terrain." },
  { id: "all", title: "Tous les scripts", desc: "Exécute les 3 scripts dans l'ordre." },
];

export default function AdminScripts() {
  const [writeDb, setWriteDb] = useState(true);
  const [maxParPoule, setMaxParPoule] = useState(4);
  const [preserveExistingStaff, setPreserveExistingStaff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Prêt.");
  const [logs, setLogs] = useState(["Logs script..."]);

  const statusClass = useMemo(() => {
    if (status.startsWith("Succès")) return "admin-alert admin-alert-ok";
    if (status.startsWith("Échec") || status.startsWith("Erreur")) return "admin-alert admin-alert-err";
    return "admin-alert";
  }, [status]);

  function pushLog(text) {
    const now = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${now}] ${text}`, ...prev].slice(0, 200));
  }

  async function runScript(scriptName) {
    setBusy(true);
    setStatus(`Execution en cours: ${scriptName}...`);
    pushLog(
      `Lancement de ${scriptName} (write_db=${writeDb}, max_par_poule=${maxParPoule}, preserve_existing_staff=${preserveExistingStaff})`
    );

    try {
      const res = await api.post(`/api/admin/scripts/${scriptName}/run`, {
        write_db: writeDb,
        max_par_poule: Number(maxParPoule),
        preserve_existing_staff: preserveExistingStaff,
      });

      const body = res.data || {};
      if (body.ok === false) {
        const errMsg = body.error || body.stderr || body.stdout || "Erreur inconnue";
        setStatus(`Échec: ${scriptName}`);
        pushLog(`ECHEC ${scriptName}\n${errMsg}`);
        return;
      }

      setStatus(`Succès: ${scriptName}`);
      const output = [body.stdout, body.stderr].filter(Boolean).join("\n");
      pushLog(`OK ${scriptName}\n${output || "(aucune sortie)"}`);
    } catch (error) {
      const errMsg = error?.response?.data?.error || error?.message || "Erreur réseau";
      setStatus(`Erreur réseau: ${scriptName}`);
      pushLog(`ERREUR ${scriptName}\n${errMsg}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout title="Exécution des Scripts de Planning" subtitle="Lancer les scripts Python avec la base PostgreSQL">
      <div className="admin-two-col">
        <div className="admin-card">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <label>
              <input type="checkbox" checked={writeDb} onChange={(e) => setWriteDb(e.target.checked)} /> Écrire en base
            </label>
            <label>
              <input
                type="checkbox"
                checked={preserveExistingStaff}
                onChange={(e) => setPreserveExistingStaff(e.target.checked)}
              />{" "}
              Conserver les affectations staff existantes (sinon écraser)
            </label>
            <label>
              Max équipes/poule{" "}
              <input
                type="number"
                min={2}
                max={20}
                value={maxParPoule}
                onChange={(e) => setMaxParPoule(e.target.value)}
                style={{ width: 70 }}
              />
            </label>
            <Link to="/admin/poules" className="admin-nav-link">Voir poules</Link>
          </div>

          <div className="admin-grid">
            {scriptList.map((script) => (
              <div className="admin-card" key={script.id}>
                <strong>{script.title}</strong>
                <p>{script.desc}</p>
                <button disabled={busy} className="admin-btn" onClick={() => runScript(script.id)}>
                  Lancer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className={statusClass}>{status}</div>
          <div style={{ maxHeight: 520, overflow: "auto", whiteSpace: "pre-wrap", background: "#0f172a", color: "#e5e7eb", borderRadius: 8, padding: 12 }}>
            {logs.join("\n\n")}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
