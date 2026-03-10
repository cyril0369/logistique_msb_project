import Desktop from "../components/desktop.jsx";
import FormulaireConnexion from "../components/FormulaireConnexion.jsx";

export default function AccueilConnexion() {
    return (
        <div className="Page">
            <Desktop />
            <main className="main-connection">
                <FormulaireConnexion />
            </main>
        </div>
    )
}
