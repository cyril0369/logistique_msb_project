import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { IoPersonCircleOutline } from "react-icons/io5";
import LogoCouleur from "../images/464515b70379eaca6faa8af8ddfae9b805a7bb96.png";
import Sidebare from "./Sidebare.jsx";

export default function Desktop() {
  const [isSidebarHidden, setIsSidebarHidden] = useState(true);
  const navigate = useNavigate();

  function toggleHamburger() {
    setIsSidebarHidden(prev => !prev);
  }

  const isOpen = !isSidebarHidden;

  return (
    <>
      <header className="desktop">
        <button
          className={`hamburger-btn ${isOpen ? "open" : ""}`}
          aria-pressed={isOpen}
          aria-label="Menu"
          onClick={toggleHamburger}
        >
          {isOpen ? (
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
        <IoPersonCircleOutline className="icon-connextion" />
      </header>

      <Sidebare isHidden={isSidebarHidden} />
    </>
  );
}
