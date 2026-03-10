import Desktop from "../components/desktop"
import ListeGoodies from "../components/ListeGoodies"

export default function CommandeGoodies() {
    return(
        <div className="Page">
            <Desktop />
            <main>
                <ListeGoodies />
            </main>
        </div>
    )
}