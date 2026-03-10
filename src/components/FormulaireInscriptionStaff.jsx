import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
        type_staff: '',
        staff_autres_assos: null,
        participation_pompims: null,
        preference_heures_max: 8,
        contrainte_heures_consecutives_max: 4,
        remarques_staff: ''
    });

    const [competencesSelectionnees, setCompetencesSelectionnees] = useState([]);
    const [disponibilitesSelectionnees, setDisponibilitesSelectionnees] = useState([]);

    const creneauxParTypeStaff = {
        Mixte: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
            15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39
        ],
        Jour: [
            1, 2, 3, 4, 5, 6, 7, 8,
            15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            31, 32, 33, 34, 35, 36, 37, 38, 39
        ],
        Nuit: [
            9, 10, 11, 12, 13, 14,
            25, 26, 27, 28, 29, 30
        ]
    };

    useEffect(() => {
        const savedData = localStorage.getItem('inscriptionData');
        if (savedData) {
            setInfoPersonnelles(JSON.parse(savedData));
        } else {
            alert('Veuillez d\'abord remplir le formulaire d\'inscription');
            navigate('/acceuil/inscription');
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
                taille_tshirt: formData.taille_tshirt,
                regime_alimentaire: formData.regime_alimentaire,
                remarques: formData.remarques,
                id_ecole: parseInt(formData.id_ecole) || null
            };

            // 1. Créer le compte personne
            const userData = await signup(completeData);
            const id_personne = userData?.user?.id;

            // 2. Créer le profil staffeur avec compétences et disponibilités
            if (id_personne) {
                await api.post('/staffeur', {
                    id_personne,
                    type_staff: staffData.type_staff,
                    staff_autres_assos: staffData.staff_autres_assos,
                    participation_pompims: staffData.participation_pompims,
                    preference_heures_max: staffData.preference_heures_max || null,
                    contrainte_heures_consecutives_max: staffData.contrainte_heures_consecutives_max || null,
                    remarques_staff: staffData.remarques_staff || null,
                    competences: competencesSelectionnees,
                    disponibilites: disponibilitesSelectionnees
                });
            }

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
        
        if (!formData.taille_tshirt || !formData.regime_alimentaire || !formData.id_ecole) {
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
                                onChange={(e) => {
                                    const selectedType = e.target.value;
                                    setStaffData({...staffData, type_staff: selectedType});
                                    setDisponibilitesSelectionnees(creneauxParTypeStaff[selectedType] || []);
                                }}
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
                            onChange={() => setCompetencesSelectionnees(prev => [...new Set([...prev, 1, 2, 3])])}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="tireuse"
                            value="non"
                            onChange={() => setCompetencesSelectionnees(prev => prev.filter(c => ![1, 2, 3].includes(c)))}
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
                            value="non"
                            onChange={() => setCompetencesSelectionnees(prev => [...new Set([...prev, 4, 5, 6, 7])])}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="cuisine"
                            value="oui"
                            onChange={() => setCompetencesSelectionnees(prev => prev.filter(c => ![4, 5, 6, 7].includes(c)))}
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
                            value="non"
                            onChange={() => setCompetencesSelectionnees(prev => [...new Set([...prev, 11])])}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer1"
                            value="oui"
                            onChange={() => setCompetencesSelectionnees(prev => prev.filter(c => ![11].includes(c)))}
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
                            value="non"
                            onChange={() => setCompetencesSelectionnees(prev => [...new Set([...prev, 11])])}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer2"
                            value="oui"
                            onChange={() => setCompetencesSelectionnees(prev => prev.filter(c => ![11].includes(c)))}
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
                            value="non"
                            onChange={() => setCompetencesSelectionnees(prev => [...new Set([...prev, 8])])}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer3"
                            value="oui"
                            onChange={() => setCompetencesSelectionnees(prev => prev.filter(c => ![8].includes(c)))}
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
                            value="non"
                            onChange={() => setCompetencesSelectionnees(prev => [...new Set([...prev, 9])])}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer4"
                            value="oui"
                            onChange={() => setCompetencesSelectionnees(prev => prev.filter(c => ![9].includes(c)))}
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
                            value="non"
                            onChange={() => setCompetencesSelectionnees(prev => [...new Set([...prev, 15,16,17])])}
                            className='cases'
                        />
                        <p className="corps-2">OUI</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="arbitrer5"
                            value="oui"
                            onChange={() => setCompetencesSelectionnees(prev => prev.filter(c => ![15,16,17].includes(c)))}
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
