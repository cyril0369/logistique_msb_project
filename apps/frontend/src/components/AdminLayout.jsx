import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Desktop from "./desktop";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/users", label: "Utilisateurs" },
  { to: "/order_detail", label: "Commandes" },
  { to: "/jobs", label: "Jobs" },
  { to: "/admin/scripts", label: "Scripts" },
  { to: "/admin/poules", label: "Poules" },
];

export default function AdminLayout({ title, subtitle, children }) {
  const { logout } = useAuth();

  return (
    <div className="Page">
      <Desktop />
      <main className="admin-main">
        <div className="admin-shell">
          <header className="admin-topbar">
            <div className="titre-sous-titre block" style={{ alignItems: "flex-start" }}>
              <h1>{title}</h1>
              {subtitle ? <p className="sous-titre-1">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              className="se-connecter admin-logout"
              onClick={async () => {
                await logout();
                window.location.href = "/accueil/connexion";
              }}
            >
              <h4>Déconnexion</h4>
            </button>
          </header>

          <nav className="admin-nav">
            {links.map((item) => (
              <Link key={item.to} to={item.to} className="admin-nav-link">
                {item.label}
              </Link>
            ))}
          </nav>

          <section className="admin-content">{children}</section>
        </div>
      </main>
    </div>
  );
}
