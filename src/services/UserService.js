import axios from 'axios';

const API_URL = 'http://localhost:8000/auth';

export const userService = {
  async getUser(username) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  async updateUser(userData) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_URL}/users/${username}`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  },

  async registerUser(userData) {
    console.log(userData);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/register`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error registrando usuario:', error);
      throw error;
    }
  },

  async listUsers() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error listando usuarios:', error);
      throw error;
    }
  },

  async deleteUser(username) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${API_URL}/users/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }
};