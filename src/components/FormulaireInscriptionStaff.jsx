import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FormulaireInscriptionStaff() {
    const navigate = useNavigate();
    const { updateUserStatus } = useAuth();
    
    const [infoPersonnelles, setInfoPersonnelles] = useState(null);
    const [formData, setFormData] = useState({
        taille_tshirt: '',
        regime_alimentaire: '',
        remarques: '',
        id_ecole: ''
    });

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

            const response = await fetch('http://localhost:8000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(completeData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Erreur lors de l\'inscription');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.removeItem('inscriptionData');

            alert('Inscription réussie !');
            updateUserStatus('Staff');
            navigate('/');

        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            alert('erreur ! ' + error.message);
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
                <button type="submit" className="se-connecter">
                    <h4>S'inscrire</h4>
                </button>
                <p className="corps-2">* Champs obligatoire</p>
                
            </div>
        </form>
    )
}
