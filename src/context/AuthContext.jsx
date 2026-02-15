import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState({role: 'default'}); // L'utilisateur sera stocké ici

  // Cette fonction sera appelée après une connexion réussie
  const login = (userData) => {
    // Pour l'instant, on simule un utilisateur.
    // Dans le futur, vous recevrez ces données de votre backend.
    const mockUser = {
      name: userData.email, // ou un autre nom d'utilisateur
      role: 'admin', // 'admin', 'staff', 'participant'
    };
    setUser(mockUser);
    // Vous pourriez aussi stocker le token ici si nécessaire
  };

  const logout = () => {
    setUser({role: 'default'});
  };

  const updateUserStatus = (role) => {
    setUser((prev) => ({ ...prev, role }));
  };

  const value = {
    user,
    login,
    logout,
    updateUserStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
