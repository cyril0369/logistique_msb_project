import TeeShirt from "../images/tee-shirt.png";
import Bob from "../images/bob.png";
import Maillot from '../images/maillot.png';
import Short from '../images/short.png';
import Gourde from '../images/gourde.png';
import { MdLabel } from "react-icons/md";
import { useState } from "react";
import api from "../services/api";

export default function ListeGoodies() {
    const [quantities, setQuantities] = useState({
        tshirt_qty: 0,
        bob_qty: 0,
        short_qty: 0,
        maillot_qty: 0,
        gourde_qty: 0,
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const setQty = (key, value) => {
        const parsed = Number.parseInt(value, 10);
        setQuantities((prev) => ({
            ...prev,
            [key]: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed,
        }));
    };

    const submitOrder = async () => {
        setMessage("");
        setError("");

        try {
            const payload = {
                ...quantities,
                // Keep legacy fields populated for backward compatibility on older backends.
                gourd_qty: quantities.gourde_qty,
                goodie3_qty: quantities.bob_qty,
            };

            const res = await api.post("/api/orders", payload);
            setMessage(typeof res.data === "string" ? res.data : "Commande enregistrée !");
            setQuantities({
                tshirt_qty: 0,
                bob_qty: 0,
                short_qty: 0,
                maillot_qty: 0,
                gourde_qty: 0,
            });
        } catch (e) {
            setError(e?.response?.data || e?.message || "Erreur lors de la commande");
        }
    };

    return(
        <div className="ListeGoodies">
            <div className="titre-sous-titre block">
                <h1>Commander des goodies</h1>
            </div>
            <div className="block goodies">
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
                            <input
                              type="number"
                              min="0"
                              value={quantities.tshirt_qty}
                              onChange={(e) => setQty("tshirt_qty", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="block goodies">
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
                            <input
                              type="number"
                              min="0"
                              value={quantities.bob_qty}
                              onChange={(e) => setQty("bob_qty", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="block goodies">
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
                            <input
                              type="number"
                              min="0"
                              value={quantities.short_qty}
                              onChange={(e) => setQty("short_qty", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="block goodies">
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
                            <input
                              type="number"
                              min="0"
                              value={quantities.maillot_qty}
                              onChange={(e) => setQty("maillot_qty", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="block goodies">
                <h2>Gourde</h2>
                <div className="article">
                    <img src={Gourde} alt="" />
                    <div className="info">
                        <div className="prix">
                            <MdLabel />
                            <p className="sous-titre-1">2€</p>
                        </div>
                        <div className="selector">
                            <p className="corps-2">Quantité</p>
                            <input
                              type="number"
                              min="0"
                              value={quantities.gourde_qty}
                              onChange={(e) => setQty("gourde_qty", e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {message ? <p className="corps-1" style={{ color: "#1b5e20" }}>{message}</p> : null}
            {error ? <p className="corps-1" style={{ color: "#b71c1c" }}>{String(error)}</p> : null}
            <div className="button-mdp-oublier block">
                <button className="se-connecter" onClick={submitOrder}>
                    <h4>Valider</h4>
                </button>
            </div>
        </div>
    )
}