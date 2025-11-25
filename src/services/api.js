import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Respuesta Global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado / Token vencido)
    if (error.response && error.response.status === 401) {
      
      // 1. Evitar bucle infinito si ya estamos en login
      if (!window.location.pathname.includes('/login')) {
        
        // 2. Limpiar localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role'); 
        
        // 3. Mostrar Alerta (Usamos alert nativo para asegurar que frene la ejecución)
        alert("⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        
        // 4. Redirigir al login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;