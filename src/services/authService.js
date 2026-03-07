const API_URL = 'http://localhost:8000';

export const authService = {

  signup: async (userData) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erreur d\'inscription');
    }

    const data = await response.json();
    
    // Stocker le token et l'utilisateur
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  login: async (email, mot_de_passe) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, mot_de_passe })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || data.error || 'Erreur de connexion');
    }

    const data = await response.json();
    
    // Stocker le token et l'utilisateur
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },
}
