export default function FormulaireConnexion() {
    return(
        <div className="FormulaireConnexion">
            <div className="titre-sous-titre">
                <h1>Connexion</h1>
                <p className="sous-titre-1">Nouveau sur ce site ? S’inscrire</p>
            </div>
            <div className="champ-de-saisie">
                <p className="corps-2">E-mail</p>
                <input type="text" />
                <p className="corps-2">Mot de passe</p>
                <input type="text" />
            </div>
            <div className="boutton-mdp-oublier">
                <button className="se-connecter">
                    <h4>Se connecter</h4>
                </button>
                <p className="sous-titre-2">Mot de passe oublié ?</p>
                
            </div>
        </div>
    )
}