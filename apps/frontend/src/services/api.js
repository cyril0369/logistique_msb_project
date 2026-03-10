import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  withCredentials: true,
});

// ✅ Gère les erreurs 401 (token expiré/invalide)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;