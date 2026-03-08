import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function SidebareProfil ({ isHidden }) {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    if (user === null) {
        return (
            <div className={`sidebare-profil ${isHidden ? 'Hidden' : ''}`}>
                <button type="button" className="menu-item">Connection / Inscription</button>
            </div>
        )
    }

    return (
        <div className={`sidebare-profil ${isHidden ? 'Hidden' : ''}`}>
            <button type="button" className="menu-item">Mon profil</button>
            <button type="button" className="menu-item" onClick={handleLogout}>Deconnection</button>
        </div>
    )
}
