import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />; 
  }

  // Si hay children, renderizarlos, si no, usar Outlet para rutas anidadas
  return children || <Outlet />;
};

export default PrivateRoute;