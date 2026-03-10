import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function FormulaireInscription() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        genre: '',
        email: '',
        telephone: '',
        mot_de_passe: '',
        confirmation_mot_de_passe: '',
        statut: ''
    });

    return(
        <div className="Formulaire">
            <div className="titre-sous-titre block">
                <h1>Inscription</h1>
                <p className="sous-titre-1" onClick={() => navigate("/accueil/connexion")} >Déjà inscrit ? Se connecter</p>
            </div>
            <div className="champ-de-saisie block">
                <p className="corps-2">Nom *</p>
                <input 
                    type="text" 
                    className='input-text'
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                />
                <p className="corps-2">Prenom *</p>
                <input 
                    type="text" 
                    className='input-text'
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                />
                <p className="corps-2">genre *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="genre" 
                            value="Homme" 
                            checked={formData.genre === "Homme"} 
                            onChange={(e) => setFormData({...formData, genre: e.target.value})} 
                            className='cases'
                        />
                        <p className="corps-2">Homme</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="genre" 
                            value="Femme" 
                            checked={formData.genre === "Femme"} 
                            onChange={(e) => setFormData({...formData, genre: e.target.value})} 
                            className='cases'
                        />
                        <p className="corps-2">Femme</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="genre" 
                            value="Autre" 
                            checked={formData.genre === "Autre"} 
                            onChange={(e) => setFormData({...formData, genre: e.target.value})} 
                            className='cases'
                        />
                        <p className="corps-2">Autre</p>
                    </div>
                </div>  
                <p className="corps-2">Email *</p>
                <input 
                    type="email" 
                    className='input-text'
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <p className="corps-2">Telephone *</p>
                <input 
                    type="tel" 
                    className='input-text'
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                />
                <p className="corps-2">Mot de passe *</p>
                <input 
                    type="password" 
                    className='input-text'
                    value={formData.mot_de_passe}
                    onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                />
                <p className="corps-2">Confirmation de mot de passe *</p>
                <input 
                    type="password" 
                    className='input-text'
                    value={formData.confirmation_mot_de_passe}
                    onChange={(e) => setFormData({...formData, confirmation_mot_de_passe: e.target.value})}
                />
                <p className="corps-2">Status *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="status" 
                            value="TeamMSB" 
                            checked={formData.statut === "TeamMSB"} 
                            onChange={(e) => setFormData({...formData, statut: e.target.value})} 
                            className='cases'
                        />
                        <p className="corps-2">Team MSB</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="status" 
                            value="Staff" 
                            checked={formData.statut === "Staff"} 
                            onChange={(e) => setFormData({...formData, statut: e.target.value})} 
                            className='cases'
                        />
                        <p className="corps-2">Staff</p>
                    </div>
                    <div className="case-a-cocher">
                        <input 
                            type="radio" 
                            name="status" 
                            value="Participant" 
                            checked={formData.statut === "Participant"} 
                            onChange={(e) => setFormData({...formData, statut: e.target.value})} 
                            className='cases'
                        />
                        <p className="corps-2">Participant</p>
                    </div>
                </div>  
            </div>
            <div className="button-mdp-oublier block">
                <button 
                    className="se-connecter" 
                    onClick={() => {
                        // Validation
                        if (!formData.nom || !formData.prenom || !formData.email || !formData.mot_de_passe || !formData.statut) {
                            alert('Veuillez remplir tous les champs obligatoires');
                            return;
                        }
                        if (formData.mot_de_passe !== formData.confirmation_mot_de_passe) {
                            alert('Les mots de passe ne correspondent pas');
                            return;
                        }
                        // Sauvegarder dans localStorage pour passer au formulaire suivant
                        localStorage.setItem('inscriptionData', JSON.stringify(formData));
                        navigate(`/accueil/inscription/${formData.statut}`);
                    }}
                >
                    <h4>Suivant</h4>
                </button>
                <p className="corps-2">* Champs obligatoires</p>
            </div>
        </div>
    )
}
