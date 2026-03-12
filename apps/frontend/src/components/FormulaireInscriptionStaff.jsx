import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FormulaireInscriptionStaff() {
    const navigate = useNavigate();
    const { signup } = useAuth();
    
    const [infoPersonnelles, setInfoPersonnelles] = useState(null);
    const [formData, setFormData] = useState({
        taille_tshirt: '',
        regime_alimentaire: '',
        remarques: '',
        id_ecole: ''
    });

    const [staffData, setStaffData] = useState({
        staff_code: '',
        type_staff: '',
        staff_autres_assos: null,
        participation_pompims: null,
        preference_heures_max: 8,
        contrainte_heures_consecutives_max: 4,
        remarques_staff: ''
    });

    const [competenceFlags, setCompetenceFlags] = useState({
        tireuse: false,
        cuisine: false,
        arbitre_beach_rugby: false,
        arbitre_handball: false,
        arbitre_beach_volley: false,
        arbitre_beach_soccer: false,
        premiers_secours: false,
    });

    const setFlag = (flagName, value) => {
        setCompetenceFlags((prev) => ({ ...prev, [flagName]: value }));
    };

    useEffect(() => {
        const savedData = localStorage.getItem('inscriptionData');
        if (savedData) {
            setInfoPersonnelles(JSON.parse(savedData));
        } else {
            alert('Veuillez d\'abord remplir le formulaire d\'inscription');
            navigate('/accueil/inscription');
        }
    }, [navigate]);

    const handleSignup = async () => {
        try {
            const completeData = {
                prenom: infoPersonnelles.prenom,
                nom: infoPersonnelles.nom,
                email: infoPersonnelles.email,
                mot_de_passe: infoPersonnelles.mot_de_passe,
                telephone: infoPersonnelles.telephone || null,
                genre: infoPersonnelles.genre || null,
                statut: 'Staff',
                staff_code: staffData.staff_code,
                staff_type: staffData.type_staff.toLowerCase(),
                tireuse: competenceFlags.tireuse ? 1 : 0,
                cuisine: competenceFlags.cuisine ? 1 : 0,
                arbitre_beach_rugby: competenceFlags.arbitre_beach_rugby ? 1 : 0,
                arbitre_handball: competenceFlags.arbitre_handball ? 1 : 0,
                arbitre_beach_volley: competenceFlags.arbitre_beach_volley ? 1 : 0,
                arbitre_beach_soccer: competenceFlags.arbitre_beach_soccer ? 1 : 0,
                taille_tshirt: formData.taille_tshirt,
                regime_alimentaire: formData.regime_alimentaire,
                remarques: formData.remarques,
                id_ecole: parseInt(formData.id_ecole) || null
            };

            await signup(completeData);

            localStorage.removeItem('inscriptionData');
            alert('Inscription réussie !');
            navigate('/');

        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            alert('Erreur ! ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!staffData.staff_code || !staffData.type_staff || !formData.taille_tshirt || !formData.regime_alimentaire || !formData.id_ecole) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        handleSignup();
    };

    if (!infoPersonnelles) {
        return <div>Chargement...</div>;
    }

    return(
        <form onSubmit={handleSubmit} className="Formulaire">

            <div className="titre-sous-titre block">
                <h1>Inscription<br />Staff</h1>
            </div>

            <div className="champ-de-saisie block">
                <h4>Code staff</h4>
                <p className="corps-2">Code staff *</p>
                <input
                    type="text"
                    className='input-text'
                    value={staffData.staff_code}
                    onChange={(e) => setStaffData({...staffData, staff_code: e.target.value})}
                    required
                />
            </div>

            <div className="champ-de-saisie block">
                <h4>Informations Personnelles</h4>
                <p className="corps-2">Taille de t-shirt *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="taille_tshirt"
                            value="S"
                            checked={formData.taille_tshirt === 'S'}
                            onChange={(e) => setFormData({...formData, taille_tshirt: e.target.value})}
                            className='cases'
                        />
                        <p className="corps-2">S</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="taille_tshirt"
                            value="M"
                            checked={formData.taille_tshirt === 'M'}
                            onChange={(e) => setFormData({...formData, taille_tshirt: e.target.value})}
                            className='cases'
                        />
                        <p className="corps-2">M</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="taille_tshirt"
                            value="L"
                            checked={formData.taille_tshirt === 'L'}
                            onChange={(e) => setFormData({...formData, taille_tshirt: e.target.value})}
                            className='cases'
                        />
                        <p className="corps-2">L</p>
                    </div>
                </div>  
                <p className="corps-2">Régime alimentaire *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="regime_alimentaire"
                            value="Végétarien"
                            checked={formData.regime_alimentaire === 'Végétarien'}
                            onChange={(e) => setFormData({...formData, regime_alimentaire: e.target.value})}
                            className='cases'
                        />
                        <p className="corps-2">Végétarien</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="regime_alimentaire"
                            value="Halal"
                            checked={formData.regime_alimentaire === 'Halal'}
                            onChange={(e) => setFormData({...formData, regime_alimentaire: e.target.value})}
                            className='cases'
                        />
                        <p className="corps-2">Halal</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="regime_alimentaire"
                            value="Allergies"
                            checked={formData.regime_alimentaire === 'Allergies'}
                            onChange={(e) => setFormData({...formData, regime_alimentaire: e.target.value})}
                            className='cases'
                        />
                        <p className="corps-2">Allergies</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="regime_alimentaire"
                            value="Aucun"
                            checked={formData.regime_alimentaire === 'Aucun'}
                            onChange={(e) => setFormData({...formData, regime_alimentaire: e.target.value})}
                            className='cases'
                        />
                        <p className="corps-2">Aucun</p>
                    </div>
                </div>  
                <p className="corps-2">Remarques / spécifications</p>
                <input 
                    type="text" 
                    className='input-text'
                    value={formData.remarques}
                    onChange={(e) => setFormData({...formData, remarques: e.target.value})}
                />
                <p className="corps-2">Ecole (ID) *</p>
                <input 
                    type="number" 
                    className='input-text'
                    value={formData.id_ecole}
                    onChange={(e) => setFormData({...formData, id_ecole: e.target.value})}
                    required
                />
            </div>

            <div className="champ-de-saisie block">
                <h4>Informations Staff</h4>
                <p className="corps-2">Type de staff souhaité *</p>
                <div className='cases-a-cocher'>
                    {['Mixte', 'Jour', 'Nuit'].map(type => (
                        <div className="case-a-cocher" key={type}>
                            <input
                                type="radio"
                                name="type_staff"
                                value={type}
                                checked={staffData.type_staff === type}
                                onChange={(e) => setStaffData({...staffData, type_staff: e.target.value})}
                                className='cases'
                            />
                            <p className="corps-2">{type}</p>
                        </div>
                    ))}
                </div>
                <p className="corps-2">Staff pour d'autres assos *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input
                            type="radio"
                            name="staff_autres_assos"
                            checked={staffData.staff_autres_assos === true}
                            onChange={() => setStaffData({...staffData, staff_autres_assos: true})}
                        />
                        <p>OUI</p>
                    </div>

                    <div className="case-a-cocher">
                        <input
                            type="radio"
                            name="staff_autres_assos"
                            checked={staffData.staff_autres_assos === false}
                            onChange={() => setStaffData({...staffData, staff_autres_assos: false})}
                        />
                        <p>NON</p>
                    </div>
                </div>
                <p className="corps-2">Participation au show Pompims *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input
                            type="radio"
                            name="pompims"
                            checked={staffData.participation_pompims === true}
                            onChange={() => setStaffData({...staffData, participation_pompims: true})}
                        />
                        <p>OUI</p>
                    </div>

                    <div className="case-a-cocher">
                        <input
                            type="radio"
                            name="pompims"
                            checked={staffData.participation_pompims === false}
                            onChange={() => setStaffData({...staffData, participation_pompims: false})}
                        />
                        <p>NON</p>
                    </div>
                </div>
            </div>

            <div className="champ-de-saisie block">
                <p className="corps-2">Tu sais te servir d'une tireuse ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="tireuse"
                            value="oui"
                            checked={competenceFlags.tireuse === true}
                            onChange={() => setFlag('tireuse', true)}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="tireuse"
                            value="non"
                            checked={competenceFlags.tireuse === false}
                            onChange={() => setFlag('tireuse', false)}
                            className='cases'
                        />
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l'aise en cuisine ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="cuisine"
                            value="oui"
                            checked={competenceFlags.cuisine === true}
                            onChange={() => setFlag('cuisine', true)}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="cuisine"
                            value="non"
                            checked={competenceFlags.cuisine === false}
                            onChange={() => setFlag('cuisine', false)}
                            className='cases'
                        />
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l'aise pour arbitrer du Beach Rugby ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer1"
                            value="oui"
                            checked={competenceFlags.arbitre_beach_rugby === true}
                            onChange={() => setFlag('arbitre_beach_rugby', true)}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer1"
                            value="non"
                            checked={competenceFlags.arbitre_beach_rugby === false}
                            onChange={() => setFlag('arbitre_beach_rugby', false)}
                            className='cases'
                        />
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l'aise pour arbitrer du Sandball ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer2"
                            value="oui"
                            checked={competenceFlags.arbitre_handball === true}
                            onChange={() => setFlag('arbitre_handball', true)}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer2"
                            value="non"
                            checked={competenceFlags.arbitre_handball === false}
                            onChange={() => setFlag('arbitre_handball', false)}
                            className='cases'
                        />
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l'aise pour arbitrer du Beach Volley ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer3"
                            value="oui"
                            checked={competenceFlags.arbitre_beach_volley === true}
                            onChange={() => setFlag('arbitre_beach_volley', true)}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer3"
                            value="non"
                            checked={competenceFlags.arbitre_beach_volley === false}
                            onChange={() => setFlag('arbitre_beach_volley', false)}
                            className='cases'
                        />
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Tu es à l'aise pour arbitrer du Beach Soccer ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer4"
                            value="oui"
                            checked={competenceFlags.arbitre_beach_soccer === true}
                            onChange={() => setFlag('arbitre_beach_soccer', true)}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer4"
                            value="non"
                            checked={competenceFlags.arbitre_beach_soccer === false}
                            onChange={() => setFlag('arbitre_beach_soccer', false)}
                            className='cases'
                        />
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                {/* <p className="corps-2">Si tu devais choisir, quelle activité aimerais-tu animer ? *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Tu serais prêt à animer un cours d'aquagym ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="checkbox" className='cases'/>
                        <p className="corps-2">NON</p>
                    </div>
                </div>   */}
                <p className="corps-2">Tu as les bases des Premiers Secours ? *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer5"
                            value="oui"
                            checked={competenceFlags.premiers_secours === true}
                            onChange={() => setFlag('premiers_secours', true)}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer5"
                            value="non"
                            checked={competenceFlags.premiers_secours === false}
                            onChange={() => setFlag('premiers_secours', false)}
                            className='cases'
                        />
                        <p className="corps-2">NON</p>
                    </div>
                </div>
                <p className="corps-2">Remarques / spécifications</p>
                <input type="text" className='input-text'/>
            </div> 

            {/* <div className="champ-de-saisie block">
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
                <p className="corps-2">Nom d'équipe *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Nom du capitaine d'équipe *</p>
                <input type="text" className='input-text'/>
            </div> */}

            <div className="boutton-mdp-oublier block">
                <button type="submit" className="se-connecter">
                    <h4>S'inscrire</h4>
                </button>
                <p className="corps-2">* Champs obligatoire</p>
                
            </div>
        </form>
    )
}
