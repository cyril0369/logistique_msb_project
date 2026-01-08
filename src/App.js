import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Acceuil from "./pages/acceuil";
import AcceuilConnexion from "./pages/AcceuilConnexion";
import AcceuilInscriprion from "./pages/AcceuilInscriprion";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/acceuil" replace />} />
          <Route path="/acceuil" element={<Acceuil />} />
          <Route path="/acceuil/connexion" element={<AcceuilConnexion />} />
          <Route path="/acceuil/inscription" element={<AcceuilInscriprion />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
