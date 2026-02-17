import Desktop from "../components/desktop.jsx";
import Fontacceuil from "../images/6322e2831c0871571c1043fc3cc93831d4f70abe.jpg"

export default function Acceuil() {
    
    return (
        <div className="Page">
            <Desktop />
            <main>
                <img className="image-acceil" src={Fontacceuil} alt="" />
                <h2>Page d'accueil</h2>
            </main>
        </div>
    )
}