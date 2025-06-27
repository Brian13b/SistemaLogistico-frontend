import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />; 
  }

  // Si se especifican roles, verificar que el usuario tenga uno de ellos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirigir a página de no autorizado o a un dashboard por defecto
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;