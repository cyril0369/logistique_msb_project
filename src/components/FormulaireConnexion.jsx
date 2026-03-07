import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {authService} from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function FormulaireConnexion() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { updateUserStatus } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authService.login(email, motDePasse);
            
            console.log('Connexion réussie:', data);
            navigate('/');
            updateUserStatus(data["user"]["statut"]);
            console.log(data["user"]["statut"])

        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return(
        <div className="Formulaire">
            <div className="titre-sous-titre block" >
                <h1>Connexion</h1>
                <p className="sous-titre-1" onClick={() => navigate("/acceuil/inscription")}>
                    Nouveau sur ce site ? S'inscrire
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="champ-de-saisie block">
                    <p className="corps-2">E-mail</p>
                    <input 
                        type="email" 
                        className='input-text'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@email.com"
                        required
                    />
                    
                    <p className="corps-2">Mot de passe</p>
                    <input 
                        // type="password" 
                        className='input-text'
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>

                {error && (
                    <div style={{ 
                        color: 'red', 
                        marginBottom: '10px', 
                        textAlign: 'center',
                        padding: '10px',
                        backgroundColor: '#ffebee',
                        borderRadius: '5px'
                    }}>
                        {error}
                    </div>
                )}

                <div className="boutton-mdp-oublier block">
                    <button 
                        type="submit" 
                        className="se-connecter"
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        <h4>{loading ? 'Connexion...' : 'Se connecter'}</h4>
                    </button>
                    <p className="sous-titre-2">Mot de passe oublié ?</p>
                </div>
            </form>
        </div>
    )
}