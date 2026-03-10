import { useEffect, useMemo, useState } from "react";
import Desktop from "../components/desktop";
import PlanningPersonne from "../components/PlanningPersonne";
import api from "../services/api";

const DAYS = ["Vendredi", "Samedi", "Dimanche"];

const staffTypeConfig = {
  1: "Bar",
  2: "Cuisine",
  3: "Beach Rugby",
  4: "Beach Soccer",
  5: "Beach Volley",
  6: "Dodgeball",
  7: "Handball",
};

function capitalizeDay(day = "") {
  return day ? `${day.charAt(0).toUpperCase()}${day.slice(1)}` : "";
}

export default function AdminGlobalPlanning() {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlanning() {
      setLoading(true);
      setError("");

      try {
        const [slotsRes, jobsRes] = await Promise.all([api.get("/api/creneaux"), api.get("/api/jobs")]);
        const slots = Array.isArray(slotsRes.data) ? slotsRes.data : [];
        const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];

        const jobsBySlot = jobs.reduce((acc, job) => {
          const key = Number(job.creneau);
          if (!acc[key]) acc[key] = [];
          acc[key].push(job);
          return acc;
        }, {});

        const mapped = slots.map((slot) => {
          const day = capitalizeDay(slot.day_of_week);
          const heure_debut = `${String(slot.start_hour).padStart(2, "0")}:00`;
          const heure_fin = `${String(slot.end_hour).padStart(2, "0")}:00`;
          const slotJobs = jobsBySlot[Number(slot.id)] || [];

          const summary = slotJobs.length
            ? slotJobs
                .map((job) => {
                  const type = staffTypeConfig[job.staff_type] || `Type ${job.staff_type}`;
                  const assigned = Array.isArray(job.staff_assigned) ? job.staff_assigned.length : 0;
                  const needed = Number(job.staff_needed || 1);
                  const title = job.description || type;
                  return `${title} (${assigned}/${needed})`;
                })
                .join(" | ")
            : "Aucun job";

          return {
            jour: day,
            heure_debut,
            heure_fin,
            tache: `${slot.label || `${heure_debut}-${heure_fin}`} : ${summary}`,
          };
        });

        setTaches(mapped);
      } catch (err) {
        setError(err?.response?.data || err?.message || "Erreur de chargement du planning global");
      } finally {
        setLoading(false);
      }
    }

    loadPlanning();
  }, []);

  const hourRange = useMemo(() => {
    if (!taches.length) return { start: 8, end: 20 };
    const starts = taches.map((item) => Number(String(item.heure_debut).slice(0, 2)));
    const ends = taches.map((item) => Number(String(item.heure_fin).slice(0, 2)));
    return {
      start: Math.max(0, Math.min(...starts)),
      end: Math.min(24, Math.max(...ends)),
    };
  }, [taches]);

  if (loading) {
    return (
      <div className="Page">
        <Desktop />
        <main>
          <p>Chargement du planning global...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Page">
        <Desktop />
        <main>
          <p>Erreur : {String(error)}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="Page">
      <Desktop />
      <main>
        <div className="titre-sous-titre block" style={{ marginBottom: 16 }}>
          <h1>Planning Global Admin</h1>
          <p className="sous-titre-1" style={{ color: "var(--GRIS_FONCE)" }}>
            Vue staff globale sur tous les créneaux définis
          </p>
        </div>

        <div className="planning-trois-jours">
          {DAYS.map((day) => (
            <PlanningPersonne
              key={day}
              day={day}
              taches={taches.filter((item) => item.jour === day)}
              heureDebut={hourRange.start}
              heureFin={hourRange.end}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
