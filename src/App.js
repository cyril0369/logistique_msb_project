import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Acceuil from "./pages/acceuil";
import AcceuilConnexion from "./pages/AcceuilConnexion";
import AcceuilInscriprion from "./pages/AcceuilInscriprion";
import AcceuilInscriprionTeamMSB from "./pages/AcceuilInscriprionTeamMSB.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/acceuil" replace />} />
          <Route path="/acceuil" element={<Acceuil />} />
          <Route path="/acceuil/connexion" element={<AcceuilConnexion />} />
          <Route path="/acceuil/inscription" element={<AcceuilInscriprion />} />
          <Route path="/acceuil/inscription/team" element={<AcceuilInscriprionTeamMSB />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
