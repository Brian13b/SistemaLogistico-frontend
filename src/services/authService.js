import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const API_URL = `${BASE_URL}/auth`;

const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/request-password-reset`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (email, token, newPassword, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { 
      email: email,
      token: token, 
      new_password: newPassword,
      confirm_password: confirmPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, 
        new URLSearchParams({
          username: username,
          password: password
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const decodedToken = jwtDecode(response.data.access_token);
      const userRole = decodedToken.role.toUpperCase();

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_role', userRole);

      return response.data;
    } catch (error) {
      console.error("Error en login", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return null;
    }
  
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
  
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        return null;
      }
  
      return {
        username: decodedToken.sub, 
        role: decodedToken.role
      };
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }
  
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      return false;
    }
  },

  requestPasswordReset,
  resetPassword
};