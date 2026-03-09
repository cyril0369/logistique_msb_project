import Desktop from "../components/desktop.jsx";
import PlanningPersonne from "../components/PlanningPersonne.jsx";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

                const response = await fetch(`${API_URL}/edt/${user.id}`);

                if (!response.ok) {
                    throw new Error("Impossible de récupérer le planning");
                }

                const data = await response.json();
                setEdt(Array.isArray(data) ? data : []);
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