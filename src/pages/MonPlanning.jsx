import Desktop from "../components/desktop.jsx";
import PlanningPersonne from "../components/PlanningPersonne.jsx";

export default function MonPlanning() {
    
    return (
        <div className="Page">
            <Desktop />
            <main>
                <div className="planning-trois-jours">
                    <PlanningPersonne day="vendredi" />
                    <PlanningPersonne day="samedi" />
                    <PlanningPersonne day="dimanche" />
                </div>
            </main>
        </div>
    )
}