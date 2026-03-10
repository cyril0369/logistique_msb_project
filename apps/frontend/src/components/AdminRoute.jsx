import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <div>Chargement...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/accueil/connexion" replace state={{ from: location }} />;
  }

  if (user?.role !== "TeamMSB") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
