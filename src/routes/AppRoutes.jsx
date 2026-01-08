import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import PrivateRoute from './PrivateRoute';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import Loading from '../components/common/Loading';

// Lazy loading de componentes
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Vehiculos = lazy(() => import('../pages/vehiculo/Vehiculos'));
const Conductores = lazy(() => import('../pages/conductor/Conductores'));
const Viajes = lazy(() => import('../pages/viaje/Viajes'));
const Reportes = lazy(() => import('../pages/Reportes'));
const Seguimiento = lazy(() => import('../pages/Seguimiento'));
const Facturacion = lazy(() => import('../pages/Facturacion'));
const Finanzas = lazy(() => import('../pages/Finanzas'));
const PasswordRecoveryForm = lazy(() => import('../features/auth/PasswordRecoveryForm'));
const ResetPasswordForm = lazy(() => import('../features/auth/ResetPasswordForm'));

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute restricted={true} />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        <Route path="/recuperar-contrasena" element={<PasswordRecoveryForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />

        {/* Rutas privadas (autenticadas) */}
        <Route path="/logged-in" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          {/* Rutas con protección de roles */}
          <Route path="vehiculos" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Vehiculos />
            </ProtectedRoute>
          } />
          <Route path="conductores" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Conductores />
            </ProtectedRoute>
          } />
          <Route path="viajes" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Viajes />
            </ProtectedRoute>
          } />
          <Route path="reportes" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Reportes />
            </ProtectedRoute>
          } />
          <Route path="seguimiento" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'CONDUCTOR']}>
              <Seguimiento />
            </ProtectedRoute>
          } />
          <Route path="facturacion" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Facturacion />
            </ProtectedRoute>
          } />
          <Route path="finanzas" element={
            <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
              <Finanzas />
            </ProtectedRoute>
          } />
          <Route path="" element={<Navigate to="/logged-in/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;