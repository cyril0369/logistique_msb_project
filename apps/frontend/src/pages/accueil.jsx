import Desktop from "../components/desktop.jsx";
import Fontaccueil from "../images/6322e2831c0871571c1043fc3cc93831d4f70abe.jpg"
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { FaFacebookSquare } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";


export default function Accueil() {
    const navigate = useNavigate();

    return (
        <div className="Page">
            <Desktop />
            <main className="main-accueil">
                <img className="image-accueil" src={Fontaccueil} alt="" />
                <div className="info-accueil">
                    <div className="info">
                        <h1>Massilia Sun Ball</h1>  
                        <h4>28ème édition</h4>
                    </div>
                    <div className="info1">
                        <div className="element">
                            <FaCalendarAlt className="icon"/> 
                            <h3>29 au 31 mai 2026</h3>
                        </div>
                        <div className="element clickable" onClick={() => window.open('https://www.google.com/maps/place/Le+Grau-du-Roi/@43.5219675,4.0969052,10632m/data=!3m1!1e3!4m6!3m5!1s0x12b69124a10b842b:0x4078821166b4080!8m2!3d43.537476!4d4.137918!16s%2Fm%2F02w9nvf?entry=ttu&g_ep=EgoyMDI2MDMwMi4wIKXMDSoASAFQAw%3D%3D', '_blank')}>
                            <FaLocationDot className="icon"/> 
                            <h3>Grau-du-Roi</h3>
                        </div>
                    </div>
                    <div className="info1">
                        <RiInstagramFill className="icon-app clickable" onClick={() => window.open('https://www.instagram.com/msb.ecm/', '_blank')}/>
                        <FaFacebookSquare className="icon-app clickable" onClick={() => window.open('https://www.facebook.com/MSBECM', '_blank')}/>
                        <FaYoutube className="icon-app clickable" onClick={() => window.open('https://www.youtube.com/@massiliasunball8783', '_blank')}/>
                    </div>
                    <div className="info1">
                        <button className="se-connecter" 
                        onClick={() => navigate("/accueil/inscription")}>
                            <h4 className="titre-button">S'inscrire</h4>
                        </button>
                        <button className="se-connecter" 
                        onClick={() => navigate("/about")}>
                            <h4 className="titre-button">Voir plus d'infos</h4>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}