import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Chargement...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/accueil/connexion" replace state={{ from: location }} />;
  }

  return children;
}