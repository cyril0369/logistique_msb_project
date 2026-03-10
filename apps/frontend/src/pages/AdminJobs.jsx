import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import "./admin.css";

const dayLabels = { vendredi: "Vendredi", samedi: "Samedi", dimanche: "Dimanche" };
const staffTypeConfig = {
  1: { name: "Bar" },
  2: { name: "Cuisine" },
  3: { name: "Beach Rugby" },
  4: { name: "Beach Soccer" },
  5: { name: "Beach Volley" },
  6: { name: "Dodgeball" },
  7: { name: "Handball" },
};

function formatHour(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function jobSlotText(job) {
  if (!job.day_of_week) return `Créneau #${job.creneau}`;
  return `${dayLabels[job.day_of_week] || job.day_of_week} ${formatHour(job.start_hour)}-${formatHour(job.end_hour)}`;
}

export default function AdminJobs() {
  const [allSlots, setAllSlots] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [availableByJob, setAvailableByJob] = useState({});
  const [selectedByJob, setSelectedByJob] = useState({});
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [slotForm, setSlotForm] = useState({ day_of_week: "vendredi", start_hour: 9, end_hour: 10, label: "" });
  const [jobForm, setJobForm] = useState({ creneau: "", staff_type: 1, staff_needed: 1, description: "" });
  const [filters, setFilters] = useState({ day: "", type: "" });

  const loadData = useCallback(async () => {
    setErr("");
    try {
      const [slotsRes, jobsRes] = await Promise.all([api.get("/api/creneaux"), api.get("/api/jobs")]);
      setAllSlots(slotsRes.data || []);
      setAllJobs(jobsRes.data || []);
      if (!jobForm.creneau && (slotsRes.data || [])[0]?.id) {
        setJobForm((prev) => ({ ...prev, creneau: slotsRes.data[0].id }));
      }
    } catch (error) {
      setErr(error?.response?.data || error?.message || "Erreur de chargement");
    }
  }, [jobForm.creneau]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      if (filters.day && job.day_of_week !== filters.day) return false;
      if (filters.type && String(job.staff_type) !== filters.type) return false;
      return true;
    });
  }, [allJobs, filters]);

  const selectedJob = useMemo(() => allJobs.find((job) => job.id === selectedJobId) || null, [allJobs, selectedJobId]);

  async function createSlot(event) {
    event.preventDefault();
    setErr("");
    setOk("");
    try {
      await api.post("/api/creneaux", {
        day_of_week: slotForm.day_of_week,
        start_hour: Number(slotForm.start_hour),
        end_hour: Number(slotForm.end_hour),
        label: slotForm.label,
      });
      setOk("Créneau enregistré");
      await loadData();
    } catch (error) {
      setErr(error?.response?.data || "Erreur création créneau");
    }
  }

  async function createJob(event) {
    event.preventDefault();
    setErr("");
    setOk("");
    try {
      await api.post("/api/jobs", {
        creneau: Number(jobForm.creneau),
        staff_type: Number(jobForm.staff_type),
        staff_needed: Number(jobForm.staff_needed),
        description: jobForm.description,
      });
      setOk("Job cree");
      setJobForm((prev) => ({ ...prev, description: "" }));
      await loadData();
    } catch (error) {
      setErr(error?.response?.data || "Erreur création job");
    }
  }

  async function deleteJob(jobId) {
    if (!window.confirm("Supprimer ce job ?")) return;
    setErr("");
    setOk("");
    try {
      await api.delete(`/api/jobs/${jobId}`);
      setOk("Job supprime");
      await loadData();
    } catch (error) {
      setErr(error?.response?.data || "Erreur suppression job");
    }
  }

  async function loadAvailableStaff(job) {
    setErr("");
    try {
      const res = await api.get(`/api/jobs/available-staff?creneau=${job.creneau}&staff_type=${job.staff_type}`);
      setAvailableByJob((prev) => ({ ...prev, [job.id]: res.data || [] }));
      if ((res.data || [])[0]?.id) {
        setSelectedByJob((prev) => ({ ...prev, [job.id]: String(res.data[0].id) }));
      }
      if (!(res.data || []).length) {
        setErr("Aucun staff qualifié disponible sur ce créneau");
      }
    } catch (error) {
      setErr(error?.response?.data || "Erreur chargement staff");
    }
  }

  async function assignStaff(job) {
    const selected = Number(selectedByJob[job.id]);
    if (!selected) {
      setErr("Selectionnez un staff");
      return;
    }

    const current = Array.isArray(job.staff_assigned) ? job.staff_assigned : [];
    setErr("");
    setOk("");
    try {
      await api.put(`/api/jobs/${job.id}/assign`, { staff_ids: [...current, selected] });
      setOk("Staff assigné");
      await loadData();
    } catch (error) {
      setErr(error?.response?.data || "Erreur d'assignation");
    }
  }

  async function unassignStaff(job, staff) {
    if (!window.confirm(`Retirer ${staff.first_name} ${staff.last_name} de ce job ?`)) return;
    const current = Array.isArray(job.staff_assigned) ? job.staff_assigned : [];

    setErr("");
    setOk("");
    try {
      await api.put(`/api/jobs/${job.id}/assign`, { staff_ids: current.filter((id) => id !== staff.id) });
      setOk("Staff retire");
      await loadData();
    } catch (error) {
      setErr(error?.response?.data || "Erreur de retrait");
    }
  }

  return (
    <AdminLayout title="Planning Admin" subtitle="Définir les créneaux puis affecter le staff sur vendredi, samedi et dimanche">
      {ok ? <div className="admin-alert admin-alert-ok">{ok}</div> : null}
      {err ? <div className="admin-alert admin-alert-err">{err}</div> : null}

      <div className="admin-two-col">
        <div className="admin-grid">
          <form className="admin-card admin-form-grid" onSubmit={createSlot}>
            <h3>Gestion des Créneaux</h3>
            <label>
              Jour
              <select value={slotForm.day_of_week} onChange={(e) => setSlotForm((p) => ({ ...p, day_of_week: e.target.value }))}>
                <option value="vendredi">Vendredi</option>
                <option value="samedi">Samedi</option>
                <option value="dimanche">Dimanche</option>
              </select>
            </label>
            <label>
              Heure de début
              <input type="number" min={0} max={23} value={slotForm.start_hour} onChange={(e) => setSlotForm((p) => ({ ...p, start_hour: e.target.value }))} />
            </label>
            <label>
              Heure de fin
              <input type="number" min={1} max={24} value={slotForm.end_hour} onChange={(e) => setSlotForm((p) => ({ ...p, end_hour: e.target.value }))} />
            </label>
            <label>
              Libellé (optionnel)
              <input value={slotForm.label} onChange={(e) => setSlotForm((p) => ({ ...p, label: e.target.value }))} />
            </label>
            <button className="admin-btn" type="submit">Créer / Mettre à jour le créneau</button>
          </form>

          <form className="admin-card admin-form-grid" onSubmit={createJob}>
            <h3>Nouveau Job</h3>
            <label>
              Créneau
              <select value={jobForm.creneau} onChange={(e) => setJobForm((p) => ({ ...p, creneau: e.target.value }))}>
                {allSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {(dayLabels[slot.day_of_week] || slot.day_of_week)} {formatHour(slot.start_hour)}-{formatHour(slot.end_hour)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type de staff
              <select value={jobForm.staff_type} onChange={(e) => setJobForm((p) => ({ ...p, staff_type: Number(e.target.value) }))}>
                {Object.entries(staffTypeConfig).map(([id, cfg]) => (
                  <option key={id} value={id}>{cfg.name}</option>
                ))}
              </select>
            </label>
            <label>
              Nombre de staff
              <input type="number" min={1} value={jobForm.staff_needed} onChange={(e) => setJobForm((p) => ({ ...p, staff_needed: Number(e.target.value) }))} />
            </label>
            <label>
              Description
              <textarea value={jobForm.description} onChange={(e) => setJobForm((p) => ({ ...p, description: e.target.value }))} />
            </label>
            <button className="admin-btn" type="submit">Créer le job</button>
          </form>
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <h3>Vue Horaire (V/S/D)</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Horaire</th>
                  <th>Type</th>
                  <th>Job</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {allJobs.length === 0 ? (
                  <tr><td colSpan={5}>Aucun job</td></tr>
                ) : (
                  allJobs.map((job) => (
                    <tr key={`timeline-${job.id}`}>
                      <td>{dayLabels[job.day_of_week] || "-"}</td>
                      <td>{job.start_hour != null ? `${formatHour(job.start_hour)}-${formatHour(job.end_hour)}` : "-"}</td>
                      <td>{staffTypeConfig[job.staff_type]?.name || "Inconnu"}</td>
                      <td>{job.description || `Job #${job.id}`}</td>
                      <td><button className="admin-outline-btn" type="button" onClick={() => setSelectedJobId(job.id)}>Voir</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-card">
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <select value={filters.day} onChange={(e) => setFilters((p) => ({ ...p, day: e.target.value }))}>
                <option value="">Tous les jours</option>
                <option value="vendredi">Vendredi</option>
                <option value="samedi">Samedi</option>
                <option value="dimanche">Dimanche</option>
              </select>
              <select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
                <option value="">Tous les types</option>
                {Object.entries(staffTypeConfig).map(([id, cfg]) => (
                  <option key={`ft-${id}`} value={id}>{cfg.name}</option>
                ))}
              </select>
            </div>

            <div className="admin-grid">
              {filteredJobs.length === 0 ? <p>Aucun job sur ce filtre.</p> : null}
              {filteredJobs.map((job) => {
                const assigned = job.assigned_staff_details || [];
                const needed = job.staff_needed || 1;
                const remaining = needed - assigned.length;
                return (
                  <article className="admin-card" key={job.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <div>
                        <strong>{jobSlotText(job)}</strong>
                        <div>{staffTypeConfig[job.staff_type]?.name || "Inconnu"}</div>
                        <div>{job.description || `Job #${job.id}`}</div>
                        <div>{remaining > 0 ? `${remaining} manquant(s)` : "Complet"}</div>
                      </div>
                      <button className="admin-danger-btn" type="button" onClick={() => deleteJob(job.id)}>Supprimer</button>
                    </div>

                    <div className="admin-grid" style={{ marginTop: 8 }}>
                      {assigned.length === 0 ? <p>Aucun staff assigné</p> : null}
                      {assigned.map((staff) => (
                        <div key={`${job.id}-${staff.id}`} className="admin-card" style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{staff.first_name} {staff.last_name} ({staff.email})</span>
                          <button className="admin-danger-btn" type="button" onClick={() => unassignStaff(job, staff)}>Retirer</button>
                        </div>
                      ))}
                    </div>

                    {remaining > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginTop: 8 }}>
                        <select
                          value={selectedByJob[job.id] || ""}
                          onChange={(e) => setSelectedByJob((prev) => ({ ...prev, [job.id]: e.target.value }))}
                        >
                          <option value="">Sélectionner un staff...</option>
                          {(availableByJob[job.id] || []).map((staff) => (
                            <option key={`${job.id}-s-${staff.id}`} value={staff.id}>
                              {staff.first_name} {staff.last_name} ({staff.email})
                            </option>
                          ))}
                        </select>
                        <button className="admin-outline-btn" type="button" onClick={() => loadAvailableStaff(job)}>Disponibles</button>
                        <button className="admin-btn" type="button" onClick={() => assignStaff(job)}>Assigner</button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          {selectedJob ? (
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>{selectedJob.description || `Job #${selectedJob.id}`}</h3>
                <button className="admin-outline-btn" onClick={() => setSelectedJobId(null)}>Fermer</button>
              </div>
              <p>
                {jobSlotText(selectedJob)} - {staffTypeConfig[selectedJob.staff_type]?.name || "Type inconnu"} - {selectedJob.staff_needed || 1} requis
              </p>
              <div className="admin-grid">
                {(selectedJob.assigned_staff_details || []).length === 0 ? <p>Aucune personne assignée pour le moment.</p> : null}
                {(selectedJob.assigned_staff_details || []).map((staff) => (
                  <div className="admin-card" key={`modal-${staff.id}`}>
                    <strong>{staff.first_name} {staff.last_name}</strong>
                    <div>{staff.email}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
