import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IoPersonCircleOutline } from "react-icons/io5";
import LogoCouleur from "../images/464515b70379eaca6faa8af8ddfae9b805a7bb96.png";
import Sidebar from "./Sidebar.jsx";
import SidebarProfil from "./SidebarProfil.jsx";

export default function Desktop() {
  const [isSidebarHidden, setIsSidebarHidden] = useState(true);
  const [isSidebarProfilHidden, setSidebarProfilHidden] = useState(true);
  const navigate = useNavigate();

  function toggleHamburger() {
    setIsSidebarHidden(prev => !prev);
    setSidebarProfilHidden(true); // Fermer SidebarProfil quand Sidebar s'ouvre
  }

  function toggleProfil() {
    setSidebarProfilHidden(prev => !prev);
    setIsSidebarHidden(true); // Fermer Sidebar quand SidebarProfil s'ouvre
  }

  const isSidebarOpen = !isSidebarHidden;

  return (
    <>
      <header className="desktop">
        <button
          className={`hamburger-btn ${isSidebarOpen ? "open" : ""}`}
          aria-pressed={isSidebarOpen}
          aria-label="Menu"
          onClick={toggleHamburger}
        >
          {isSidebarOpen ? (
            <img
              className="hamburger-icon icon-close"
              src="/assets/icon-close.svg"
              alt=""
              aria-hidden="false"
            />
          ) : (
            <img
              className="hamburger-icon icon-menu"
              src="/assets/icon-menu.svg"
              alt=""
              aria-hidden="false"
            />
          )}
        </button>

        <img className="LogoDesktop" src={LogoCouleur} alt="LOGO DESKTOP" onClick={() => navigate('/')} />
        <div className="clickable" onClick={toggleProfil} >
          <IoPersonCircleOutline className="icon-connexion" />
        </div>
      </header>

      <Sidebar isHidden={isSidebarHidden} />
      <SidebarProfil isHidden={isSidebarProfilHidden} />

    </>
  );
}
