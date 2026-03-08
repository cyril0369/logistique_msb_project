import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Sidebare ({ isHidden }) {

    const { user } = useAuth();
    const navigate = useNavigate();

    const menuItems = {
        default: [
            { name: "Accueil", path: "/acceuil" },
            { name: "Informations pratiques", path: "/about" },
            { name: "Connexion / Inscription", path: "/acceuil/connexion" },
        ],
        TeamMSB: [
            { name: "Accueil", path: "/acceuil" },
            { name: "Informations pratiques", path: "/about" },
            {
                name: "Espace personnel",
                children: [
                    { name: "Mon profil", path: "/profil" },
                    { name: "Commande de goodies", path: "/CommandeGoodises" },
                    { name: "Mon planning", path: "/monplanning" },
                ],
            },
            {
                name: "Espace de travail",
                children: [
                    { name: "Bureau Restreint", path: "/bureau-restreint" },
                    { name: "Pôle Logistique", path: "/pole-logistique" },
                    { name: "Pôle Tournoi", path: "/pole-tournoi" },
                    { name: "Pôle Ecole", path: "/pole-ecole" },
                    { name: "Pôle Repas", path: "/pole-repas" },
                    { name: "Pôle Soirée", path: "/pole-soiree" },
                    { name: "Pôle Sécurité", path: "/pole-securite" },
                    { name: "Pôle Communication", path: "/pole-communication" },
                    { name: "Pôle Partenariat", path: "/pole-partenariat" },
                ],
            },
        ],
        Staff: [
            { name: "Accueil", path: "/acceuil" },
            { name: "Informations pratiques", path: "/about" },
            { name: "Mon profil", path: "/" },
            { name: "Commande de goodies", path: "/CommandeGoodises" },
            { name: "Mon planning", path: "/monplanning" },
            { name: "Documents utiles", path: "/" },
        ],
        Participant: [
            { name: "Accueil", path: "/acceuil" },
            { name: "Informations pratiques", path: "/about" },
            { name: "Mon profil", path: "/" },
            { name: "Commande de goodies", path: "/CommandeGoodises" },
            { name: "Mon planning", path: "/monplanning" },
        ],
    };

    console.log(user)
    const items = (user && user.role && menuItems[user.role]) ? menuItems[user.role] : menuItems.default;

    const [openSections, setOpenSections] = useState({
        "Espace personnel": true,
        "Espace de travail": true,
    });

    const toggleSection = (sectionName) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionName]: !prev[sectionName],
        }));
    };

    return (
        <div className={`sidebare ${isHidden ? 'Hidden' : ''}`}>
            {items.map((item, index) => (
                item.children ? (
                    <div className="menu-section" key={`${item.name}-${index}`}>
                        <button
                            type="button"
                            className="menu-header"
                            onClick={() => toggleSection(item.name)}
                        >
                            <span className="menu-title">{item.name}</span>
                            <span className={`chevron ${openSections[item.name] ? 'open' : ''}`}>
                                ▾
                            </span>
                        </button>
                        <div className={`submenu ${openSections[item.name] ? 'open' : ''}`}>
                            {item.children.map((child, childIndex) => (
                                <button
                                    key={`${child.name}-${childIndex}`}
                                    type="button"
                                    className="submenu-item"
                                    onClick={() => navigate(child.path)}
                                >
                                    {child.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <button
                        key={`${item.name}-${index}`}
                        type="button"
                        className="menu-item"
                        onClick={() => navigate(item.path)}
                    >
                        {item.name}
                    </button>
                )
            ))}
        </div>
    )
}
