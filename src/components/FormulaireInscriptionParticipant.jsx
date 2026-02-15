import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FormulaireInscriptionParticipant() {
    const navigate = useNavigate();
    const { updateUserStatus } = useAuth();
    
    const handleSubmit = () => {
        // Change user status to staff (implement your logic here)
        updateUserStatus('participant');

        // Navigate to the home page
        navigate('/');
    };

    return(
        <div className="Formulaire">
            <div className="titre-sous-titre block">
                <h1>Inscription<br />Participant</h1>
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
                <p className="corps-2">Ecole *</p>
                <input type="text" className='input-text'/>
            </div>

            <div className="champ-de-saisie block">
                <h4>Information tournoi</h4>
                <p className="corps-2">Sport *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Type de tournoi *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Championship</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Loisir</p>
                    </div>
                </div> 
                <p className="corps-2">Composition *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Femme</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Homme</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Mixte</p>
                    </div>
                </div> 
                <p className="corps-2">Nombre de joueurs *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Nom d’équipe *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Nom du capitaine d’équipe *</p>
                <input type="text" className='input-text'/>
            </div>

            <div className="boutton-mdp-oublier block">
                <button className="se-connecter" onClick={handleSubmit}>
                    <h4>S’inscrire</h4>
                </button>
                <p className="corps-2">* Champs obligatoire</p>
                
            </div>
        </div>
    )
}
