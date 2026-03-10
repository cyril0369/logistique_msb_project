import Desktop from "../components/desktop.jsx";
import PlanningPersonne from "../components/PlanningPersonne.jsx";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function MonPlanning() {
    const { user } = useAuth();
    const [edt, setEdt] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    console.log(user)

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const fetchEdt = async () => {
            try {
                setLoading(true);
                setError("");

                const { data } = await api.get("/api/my-schedule");
                const mapped = (Array.isArray(data) ? data : []).map((item) => ({
                    jour: item.day_of_week
                        ? `${item.day_of_week.charAt(0).toUpperCase()}${item.day_of_week.slice(1)}`
                        : "",
                    tache: item.description || item.creneau_label || "Affectation staff",
                    heure_debut: `${String(item.start_hour).padStart(2, "0")}:00`,
                    heure_fin: `${String(item.end_hour).padStart(2, "0")}:00`,
                }));
                setEdt(mapped);
            } catch (e) {
                setError(e.message || "Erreur inconnue");
            } finally {
                setLoading(false);
            }
        };

        fetchEdt();
    }, [user]);

    console.log(edt);

    const jours = ["Vendredi", "Samedi", "Dimanche"];

    if (loading) {
        return (
            <div className="Page">
                <Desktop />
                <main>
                    <p>Chargement du planning...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="Page">
                <Desktop />
                <main>
                    <p>Erreur : {error}</p>
                </main>
            </div>
        );
    }

    return (
        <div className="Page">
            <Desktop />
            <main>
                <div className="planning-trois-jours">
                    {jours.map((jour) => (
                        <PlanningPersonne
                            key={jour}
                            day={jour}
                            taches={edt.filter((item) => item.jour === jour)}
                        />
                    ))}
                </div>
            </main>
        </div>
    )
}