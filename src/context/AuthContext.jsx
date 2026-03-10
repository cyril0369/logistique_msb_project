import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Au démarrage : restaure depuis localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      
      // S'assurer que role existe (au cas où ancien localStorage)
      if (parsedUser && !parsedUser.role && parsedUser.statut) {
        parsedUser.role = parsedUser.statut;
      }
      
      setToken(savedToken);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  // ✅ Login
  const login = async (email, mot_de_passe) => {
    try {
      const { data } = await api.post('/auth/login', { email, mot_de_passe });

      // Mapper statut → role pour compatibilité frontend
      const userWithRole = {
        ...data.user,
        role: data.user.statut
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithRole));

      setToken(data.token);
      setUser(userWithRole);

      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // ✅ Signup
  const signup = async (userData) => {
    try {
      const { data } = await api.post('/auth/signup', userData);

      // Mapper statut → role pour compatibilité frontend
      const userWithRole = {
        ...data.user,
        role: data.user.statut
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithRole));

      setToken(data.token);
      setUser(userWithRole);

      return data;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  // ✅ Logout propre
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: !!token,
      login,
      signup,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}