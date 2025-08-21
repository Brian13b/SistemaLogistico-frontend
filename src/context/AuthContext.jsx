import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/AuthService.jsx';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser() || null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const userData = await authService.login(username, password);
      
      if (!userData) {
        throw new Error("No se pudo obtener la información del usuario.");
      }
  
      const decodedToken = jwtDecode(userData.access_token);
      const role = decodedToken.role.toUpperCase();
  
      setUser({
        username: decodedToken.sub, 
        role: role, 
      });
  
      console.log("Usuario actualizado:", decodedToken.sub);
  
      return userData;
  
    } catch (error) {
      console.error("Error en login:", error);
      throw new Error("Error al iniciar sesión. Por favor, verifica tus credenciales.");
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
