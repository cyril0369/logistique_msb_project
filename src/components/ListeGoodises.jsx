import TeeShirt from "../images/tee-shirt.png";
import Bob from "../images/bob.png";
import Maillot from '../images/maillot.png';
import Short from '../images/short.png';
import Gourde from '../images/gourde.png';
import { MdLabel } from "react-icons/md";

export default function ListeGoodises() {
    return(
        <div className="ListeGoodises">
            <div className="titre-sous-titre block">
                <h1>Commander des goodies</h1>
            </div>
            <div className="block goodises">
                <h2>T-shirt</h2>
                <div className="article">
                    <img src={TeeShirt} alt="" />
                    <div className="info">
                        <div className="prix">
                            <MdLabel />
                            <p className="sous-titre-1">10€</p>
                        </div>
                        <div className="selector">
                            <p className="corps-2">Taille</p>
                            <input type="text" />
                        </div>
                        <div className="selector">
                            <p className="corps-2">Quantité</p>
                            <input type="text" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="block goodises">
                <h2>Bob</h2>
                <div className="article">
                    <img src={Bob} alt="" />
                    <div className="info">
                        <div className="prix">
                            <MdLabel />
                            <p className="sous-titre-1">15€</p>
                        </div>
                        <div className="selector">
                            <p className="corps-2">Quantité</p>
                            <input type="text" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="block goodises">
                <h2>Short de bain</h2>
                <div className="article">
                    <img src={Short} alt="" />
                    <div className="info">
                        <div className="prix">
                            <MdLabel />
                            <p className="sous-titre-1">12€</p>
                        </div>
                        <div className="selector">
                            <p className="corps-2">Taille</p>
                            <input type="text" />
                        </div>
                        <div className="selector">
                            <p className="corps-2">Quantité</p>
                            <input type="text" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="block goodises">
                <h2>Maillot de bain 2 pièces</h2>
                <div className="article">
                    <img src={Maillot} alt="" />
                    <div className="info">
                        <div className="prix">
                            <MdLabel />
                            <p className="sous-titre-1">27€</p>
                        </div>
                        <div className="selector">
                            <p className="corps-2">Taille</p>
                            <input type="text" />
                        </div>
                        <div className="selector">
                            <p className="corps-2">Quantité</p>
                            <input type="text" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="block goodises">
                <h2>T-shirt</h2>
                <div className="article">
                    <img src={Gourde} alt="" />
                    <div className="info">
                        <div className="prix">
                            <MdLabel />
                            <p className="sous-titre-1">2€</p>
                        </div>
                        <div className="selector">
                            <p className="corps-2">Taille</p>
                            <input type="text" />
                        </div>
                        <div className="selector">
                            <p className="corps-2">Quantité</p>
                            <input type="text" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}