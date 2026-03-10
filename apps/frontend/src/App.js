import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Accueil from "./pages/accueil";
import AccueilConnexion from "./pages/AccueilConnexion";
import AccueilInscription from "./pages/AccueilInscription";
import AccueilInscriptionTeamMSB from "./pages/AccueilInscriptionTeamMSB.jsx";
import AccueilInscriptionStaff from './pages/AccueilInscriptionStaff.jsx';
import AccueilInscriptionParticipant from './pages/AccueilInscriptionParticipant.jsx';
import MonPlanning from './pages/MonPlanning.jsx';
import CommandeGoodies from './pages/CommandeGoodies.jsx';
import AProposMsb from './pages/Apropos.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminJobs from './pages/AdminJobs.jsx';
import AdminOrderDetail from './pages/AdminOrderDetail.jsx';
import AdminScripts from './pages/AdminScripts.jsx';
import AdminPoulesOverview from './pages/AdminPoulesOverview.jsx';
import AdminPoulesSport from './pages/AdminPoulesSport.jsx';
import Profil from './pages/Profil.jsx';

function DashboardHome() {
  const { user } = useAuth();

  if (user?.role === 'TeamMSB') return <AdminDashboard />;
  if (user?.role === 'Staff') return <MonPlanning />;
  return <Accueil />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/accueil" replace />} />
            <Route path="/login" element={<Navigate to="/accueil/connexion" replace />} />
            <Route path="/signup" element={<Navigate to="/accueil/inscription" replace />} />
            <Route path="/signup_staff" element={<Navigate to="/accueil/inscription/staff" replace />} />
            <Route path="/signup_admin" element={<Navigate to="/accueil/inscription/teammsb" replace />} />
            <Route path="/about_us" element={<Navigate to="/about" replace />} />
            <Route path="/accueil" element={<Accueil />} />
            <Route path="/accueil/connexion" element={<AccueilConnexion />} />
            <Route path="/accueil/inscription" element={<AccueilInscription />} />
            <Route path="/accueil/inscription/teammsb" element={<AccueilInscriptionTeamMSB />} />
            <Route path="/accueil/inscription/staff" element={<AccueilInscriptionStaff />} />
            <Route path="/accueil/inscription/participant" element={<AccueilInscriptionParticipant />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
            <Route path="/dashboard/" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
            <Route path="/monplanning" element={<ProtectedRoute><MonPlanning /></ProtectedRoute>}/>
            <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
            <Route path='/CommandeGoodies' element={<ProtectedRoute><CommandeGoodies /></ProtectedRoute>} />
            <Route path='/goodies' element={<ProtectedRoute><CommandeGoodies /></ProtectedRoute>} />
            <Route path='/documents' element={<ProtectedRoute><MonPlanning /></ProtectedRoute>} />
            <Route path='/users' element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path='/jobs' element={<AdminRoute><AdminJobs /></AdminRoute>} />
            <Route path='/orders' element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
            <Route path='/order_detail' element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
            <Route path='/admin/scripts' element={<AdminRoute><AdminScripts /></AdminRoute>} />
            <Route path='/admin/poules' element={<AdminRoute><AdminPoulesOverview /></AdminRoute>} />
            <Route path='/admin/poules/:sportId' element={<AdminRoute><AdminPoulesSport /></AdminRoute>} />
            <Route path='/About' element={<AProposMsb />} />
            <Route path='/about' element={<AProposMsb />} />
            <Route path="*" element={<Navigate to="/accueil" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
