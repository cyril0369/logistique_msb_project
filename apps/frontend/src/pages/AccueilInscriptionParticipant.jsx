import Desktop from "../components/desktop.jsx";
import FormulaireInscriptionParticipant from "../components/FormulaireInscriptionParticipant.jsx";

export default function AccueilInscriptionParticipant() {
    return (
        <div className="Page">
            <Desktop />
            <main>
                <FormulaireInscriptionParticipant />
            </main>
        </div>
    )
}