import { useNavigate } from 'react-router-dom';


export default function Sidebare ({ isHidden }) {
    const navigate = useNavigate();

    return (
        <div className={`sidebare ${isHidden ? 'Hidden' : ''}`}>
            <h3 onClick={() => navigate("/acceuil")}>Accueil</h3>
            <h3>Informations pratiques</h3>
            <h3 onClick={() => navigate("/acceuil/connexion")}>Connexion / Inscription</h3>
        </div>
    )
}
