import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children, restricted = false }) => {
  const { user } = useAuth();

  // Si está restringida y el usuario está autenticado, redirigir al dashboard
  if (restricted && user) {
    return <Navigate to="/logged-in/dashboard" replace />;
  }

  // Si hay children, renderizarlos, si no, usar Outlet para rutas anidadas
  return children || <Outlet />;
};

export default PublicRoute;