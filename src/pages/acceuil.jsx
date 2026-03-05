import Desktop from "../components/desktop.jsx";
import Fontacceuil from "../images/6322e2831c0871571c1043fc3cc93831d4f70abe.jpg"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";


export default function Acceuil() {
   
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const title_acceuil = {
        default : "Massilia Sun Ball",
        admin : "Bienvenue dans l'espace admin",
        staff : "Bienvenue dans l'espace staff",
        participant : "Bienvenue dans l'espace participant"
    }

    const titre = title_acceuil[user.role]

    if (user.role !== 'default') {
        return (
            <div className="Page">
                <Desktop />
                <main className="main-acceil">
                    <div className="info-acceil">
                        <div className="info">
                            <h1>{titre}</h1>  
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="Page">
            <Desktop />
            <main className="main-acceil">
                <img className="image-acceil" src={Fontacceuil} alt="" />
                <div className="info-acceil">
                    <div className="info">
                        <h1>Massilia Sun Ball</h1>  
                        <h4>28ème édition</h4>
                    </div>
                    <div className="info1">
                        <div className="element">
                            <FaCalendarAlt className="icon"/> 
                            <h3>29 au 31 mai 2026</h3>
                        </div>
                        <div className="element">
                            <FaLocationDot className="icon"/> 
                            <h3>Grau-du-Roi</h3>
                        </div>
                    </div>
                    <div className="info1">
                        <FaInstagram className="icon-app"/>
                        <FaFacebookSquare className="icon-app"/>
                        <FaYoutube className="icon-app"/>
                    </div>
                    <div className="info1">
                        <button className="se-connecter" 
                        onClick={() => navigate("/acceuil/inscription")}>
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