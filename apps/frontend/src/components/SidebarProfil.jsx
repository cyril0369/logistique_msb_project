import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function SidebarProfil ({ isHidden }) {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };
    
    if (user === null) {
        return (
            <div className={`sidebar-profil ${isHidden ? 'Hidden' : ''}`}>
                <button type="button" className="menu-item" onClick={() => navigate('/accueil/connexion')}>Connexion / Inscription</button>
            </div>
        )
    }

    return (
        <div className={`sidebar-profil ${isHidden ? 'Hidden' : ''}`}>
            <button type="button" className="menu-item" onClick={() => navigate('/profil')}>Mon profil</button>
            <button type="button" className="menu-item" onClick={handleLogout}>Déconnexion</button>
        </div>
    )
}
