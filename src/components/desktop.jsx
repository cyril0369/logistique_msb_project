import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoPersonCircleOutline } from "react-icons/io5";
import LogoCouleur from "../images/464515b70379eaca6faa8af8ddfae9b805a7bb96.png"
import Sidebare from "./Sidebare.jsx";

export default function Desktop() {

    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarHidden(!isSidebarHidden);
    };
    
    return(
        <>
        <header className="desktop">
            <GiHamburgerMenu className="hamburger-menu" onClick={toggleSidebar} />
            <img
                className="LogoDesktop"
                src={LogoCouleur}
                alt="LOGO DESKTOP"
                />
            <IoPersonCircleOutline className="icon-connextion" />
        </header>
        <Sidebare isHidden={isSidebarHidden} />
        </>
    )
}