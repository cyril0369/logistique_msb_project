import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Acceuil from "./pages/acceuil";
import AcceuilConnexion from "./pages/AcceuilConnexion";
import AcceuilInscriprion from "./pages/AcceuilInscriprion";
import AcceuilInscriprionTeamMSB from "./pages/AcceuilInscriprionTeamMSB.jsx";
import AcceuilInscriprionStaff from './pages/AcceuilInscriprionStaff.jsx';
import AcceuilInscriprionParticipant from './pages/AcceuilInscriprionParticipant.jsx';
import MonPlanning from './pages/MonPlanning.jsx';
import CommandeGoodises from './pages/CommandeGoodises.jsx';
import AProposMsb from './pages/Apropos.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/acceuil" replace />} />
            <Route path="/acceuil" element={<Acceuil />} />
            <Route path="/acceuil/connexion" element={<AcceuilConnexion />} />
            <Route path="/acceuil/inscription" element={<AcceuilInscriprion />} />
            <Route path="/acceuil/inscription/team" element={<AcceuilInscriprionTeamMSB />} />
            <Route path="/acceuil/inscription/staff" element={<AcceuilInscriprionStaff />} />
            <Route path="/acceuil/inscription/participant" element={<AcceuilInscriprionParticipant />} />
            <Route path="/monplanning" element={<MonPlanning />} />
            <Route path='/CommandeGoodises' element={<CommandeGoodises />} />
            <Route path='/About' element={<AProposMsb />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
