import { useNavigate } from 'react-router-dom';

export default function FormulaireConnexion() {
    const navigate = useNavigate();
    return(
        <div className="Formulaire">
            <div className="titre-sous-titre block" >
                <h1>Connexion</h1>
                <p className="sous-titre-1" onClick={() => navigate("/acceuil/inscription")}>Nouveau sur ce site ? S’inscrire</p>
            </div>
            <div className="champ-de-saisie block">
                <p className="corps-2">E-mail</p>
                <input type="text" className='input-text' />
                <p className="corps-2">Mot de passe</p>
                <input type="text" className='input-text' />
            </div>
            <div className="boutton-mdp-oublier block">
                <button className="se-connecter">
                    <h4>Se connecter</h4>
                </button>
                <p className="sous-titre-2">Mot de passe oublié ?</p>
                
            </div>
        </div>
    )
}