import Desktop from "../components/desktop.jsx";
import FormulaireInscriptionStaff from "../components/FormulaireInscriptionStaff.jsx";

export default function AccueilInscriptionStaff() {
    return (
        <div className="Page">
            <Desktop />
            <main>
                <FormulaireInscriptionStaff />
            </main>
        </div>
    )
}