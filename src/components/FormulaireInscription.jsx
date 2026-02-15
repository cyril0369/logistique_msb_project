import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function FormulaireInscription() {
    const navigate = useNavigate();

    const [genre, setGenre] = useState(null);
    const [status, setStatus] = useState(null);

    return(
        <div className="Formulaire">
            <div className="titre-sous-titre block">
                <h1>Inscription</h1>
                <p className="sous-titre-1" onClick={() => navigate("/acceuil/connexion")} >Déjà inscrit ? Se connecter</p>
            </div>
            <div className="champ-de-saisie block">
                <p className="corps-2">Nom *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Prenom *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">genre *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="radio" name="genre" value="homme" checked={genre === "homme"} onChange={(e) => setGenre(e.target.value)} className='cases'/>
                        <p className="corps-2">Homme</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="radio" name="genre" value="femme" checked={genre === "femme"} onChange={(e) => setGenre(e.target.value)} className='cases'/>
                        <p className="corps-2">Femme</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="radio" name="genre" value="autre" checked={genre === "autre"} onChange={(e) => setGenre(e.target.value)} className='cases'/>
                        <p className="corps-2">Autre</p>
                    </div>
                </div>  
                <p className="corps-2">Email *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Telephone *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Mot de passe *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Confirmation de mot de passe *</p>
                <input type="text" className='input-text'/>
                <p className="corps-2">Status *</p>
                <div className='cases-a-cocher'>
                    <div className="case-a-cocher">
                        <input type="radio" name="status" value="team" checked={status === "team"} onChange={(e) => setStatus(e.target.value)} className='cases'/>
                        <p className="corps-2">Team MSB</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="radio" name="status" value="staff" checked={status === "staff"} onChange={(e) => setStatus(e.target.value)} className='cases'/>
                        <p className="corps-2">Staff</p>
                    </div>
                    <div className="case-a-cocher">
                        <input type="radio" name="status" value="participant" checked={status === "participant"} onChange={(e) => setStatus(e.target.value)} className='cases'/>
                        <p className="corps-2">Participant</p>
                    </div>
                </div>  
            </div>
            <div className="boutton-mdp-oublier block">
                <button className="se-connecter" onClick={() => navigate(`/acceuil/inscription/${status}`)}>
                    <h4>Suivant</h4>
                </button>
                <p className="corps-2">* Champs obligatoires</p>
            </div>
        </div>
    )
}
