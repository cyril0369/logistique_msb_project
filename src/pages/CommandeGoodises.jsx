import Desktop from "../components/desktop"
import ListeGoodises from "../components/ListeGoodises"

export default function CommandeGoodises() {
    return(
        <div className="Page">
            <Desktop />
            <main>
                <ListeGoodises />
            </main>
        </div>
    )
}