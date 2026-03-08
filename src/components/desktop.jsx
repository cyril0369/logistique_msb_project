import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IoPersonCircleOutline } from "react-icons/io5";
import LogoCouleur from "../images/464515b70379eaca6faa8af8ddfae9b805a7bb96.png";
import Sidebare from "./Sidebare.jsx";
import SidebareProfil from "./SidebareProfil.jsx";

export default function Desktop() {
  const [isSidebarHidden, setIsSidebarHidden] = useState(true);
  const [isSidebareProfilrHidden, setSidebareProfilHidden] = useState(true);
  const navigate = useNavigate();

  function toggleHamburger() {
    setIsSidebarHidden(prev => !prev);
    setSidebareProfilHidden(true); // Fermer SidebarProfil quand Sidebare s'ouvre
  }

  function toggleProfil() {
    setSidebareProfilHidden(prev => !prev);
    setIsSidebarHidden(true); // Fermer Sidebare quand SidebarProfil s'ouvre
  }

  const isSidebareOpen = !isSidebarHidden;

  return (
    <>
      <header className="desktop">
        <button
          className={`hamburger-btn ${isSidebareOpen ? "open" : ""}`}
          aria-pressed={isSidebareOpen}
          aria-label="Menu"
          onClick={toggleHamburger}
        >
          {isSidebareOpen ? (
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
        <div className="clicable" onClick={toggleProfil} >
          <IoPersonCircleOutline className="icon-connextion" />
        </div>
      </header>

      <Sidebare isHidden={isSidebarHidden} />
      <SidebareProfil isHidden={isSidebareProfilrHidden} />

    </>
  );
}
