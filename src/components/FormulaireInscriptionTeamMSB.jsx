import { useNavigate } from 'react-router-dom';

export default function FormulaireInscriptionTeamMSB() {
    const navigate = useNavigate();

    return(
        <div className="Formulaire">
            <div className="titre-sous-titre block">
                <h1>Inscription<br />Team MSB</h1>
                <p className="sous-titre-1" onClick={() => navigate("/acceuil/connexion")} >Déjà inscrit ? Se connecter</p>
            </div>
            <div className="champ-de-saisie block">
                <p className="corps-2">Code admin</p>
                <input type="text" className='input-text'/>
            </div>
            <div className="champ-de-saisie block">
                <h4>Informations Personnelles</h4>
                <p className="corps-2">Taille de t-shirt *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">S</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">M</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">L</p>
                    </div>
                </div>  
                <p className="corps-2">Régime alimentaire *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Végétarien</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Halal</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Allergies</p>
                    </div>
                </div>  
                <p className="corps-2">Remarques / spécifications</p>
                <input type="text" className='input-text'/>
            </div>
            <div className="boutton-mdp-oublier block">
                <button className="se-connecter">
                    <h4>S’inscrire</h4>
                </button>
                <p className="corps-2">* Champs obligatoire</p>
                
            </div>
        </div>
    )
}
