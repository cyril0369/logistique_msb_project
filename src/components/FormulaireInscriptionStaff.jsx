import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FormulaireInscriptionStaff() {
    const navigate = useNavigate();
    const { updateUserStatus } = useAuth();

    const handleSubmit = () => {
        // Change user status to staff (implement your logic here)
        updateUserStatus('staff');

        // Navigate to the home page
        navigate('/');
    };

    return(
        <div className="Formulaire">

            <div className="titre-sous-titre block">
                <h1>Inscription<br />Staff</h1>
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

            <div className="champ-de-saisie block">
                <h4>Informations Staff</h4>
                <p className="corps-2">Type de staff souhaité *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Mixte</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Jour</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">Nuit</p>
                    </div>
                </div>  
                <p className="corps-2">Staff pour d’autres assos *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Participation au show Pompims *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>  
            </div>

            <div className="champ-de-saisie block">
                <h4>Questions Staff</h4>
                <p className="corps-2">Tu sais te servir d’une tireuse ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">JE SAIS PAS</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l’aise en cuisine ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">JE SAIS PAS</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l’aise pour arbitrer du Beach Rugby ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">JE SAIS PAS</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l’aise pour arbitrer du Sandball ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">JE SAIS PAS</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l’aise pour arbitrer du Beach Soccer ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">JE SAIS PAS</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l’aise pour arbitrer du Beach Volley ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">JE SAIS PAS</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l’aise pour arbitrer du Dodgeball ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">JE SAIS PAS</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu aimerais être respo d’un sport ? *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Si tu devais choisir, quelle activité aimerais-tu animer ? *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Tu serais prêt à animer un cours d’aquagym ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>  
                <p className="corps-2">Tu as les bases des Premiers Secours ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>  
                <p className="corps-2">Remarques / spécifications</p>
                <input type="text" className='input-text'/>
            </div>

            <div className="champ-de-saisie block">
                <p className="sous-titre-2">Si tu as choisi le staff de nuit et souhaites participer au tournoi, remplis les informations ci-dessous. ↓</p>
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
