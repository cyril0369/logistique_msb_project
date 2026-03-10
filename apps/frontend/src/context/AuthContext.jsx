import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = useCallback((rawUser) => {
    if (!rawUser) return null;
    if (rawUser.role) return rawUser;
    if (rawUser.is_admin) return { ...rawUser, role: 'TeamMSB' };
    if (rawUser.is_staff) return { ...rawUser, role: 'Staff' };
    return { ...rawUser, role: 'Participant' };
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await api.get('/api/me');
      const mapped = normalizeUser(data);
      setUser(mapped);
      localStorage.setItem('user', JSON.stringify(mapped));
      return mapped;
    } catch (error) {
      localStorage.removeItem('user');
      setUser(null);
      return null;
    }
  }, [normalizeUser]);

  useEffect(() => {
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const buildSignupPayload = (userData) => {
    const first_name = userData.prenom?.trim();
    const last_name = userData.nom?.trim();
    const email = userData.email?.trim();
    const password = userData.mot_de_passe;
    const username = userData.username?.trim() || email?.split('@')[0] || `${first_name}.${last_name}`.toLowerCase();

    return {
      username,
      password,
      first_name,
      last_name,
      email,
      phone: userData.telephone || null,
      gender: userData.genre || null,
      admin_code: userData.admin_code,
      staff_code: userData.staff_code,
      staff_type: userData.staff_type || null,
      tireuse: userData.tireuse || 0,
      cuisine: userData.cuisine || 0,
      arbitre_beach_rugby: userData.arbitre_beach_rugby || 0,
      arbitre_beach_soccer: userData.arbitre_beach_soccer || 0,
      arbitre_beach_volley: userData.arbitre_beach_volley || 0,
      arbitre_dodgeball: userData.arbitre_dodgeball || 0,
      arbitre_handball: userData.arbitre_handball || 0,
    };
  };

  const login = useCallback(async (email, mot_de_passe) => {
    try {
      await api.post('/login', { email, password: mot_de_passe });
      const me = await refreshMe();
      return me;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [refreshMe]);

  const signup = useCallback(async (userData) => {
    try {
      const payload = buildSignupPayload(userData);
      const status = userData.statut;

      if (status === 'TeamMSB' && payload.admin_code) {
        await api.post('/signup_admin', payload);
      } else if (status === 'Staff' && payload.staff_code) {
        await api.post('/signup_staff', payload);
      } else {
        await api.post('/signup', payload);
      }

      const me = await refreshMe();
      return me;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }, [refreshMe]);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
    }),
    [user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}