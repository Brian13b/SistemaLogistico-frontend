import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import Vehiculos from '../pages/vehiculo/Vehiculos';
import Conductores from '../pages/conductor/Conductores';
import Viajes from '../pages/viaje/Viajes';
import Reportes from '../pages/Reportes';
import Seguimiento from '../pages/Seguimiento';
import Facturacion from '../pages/Facturacion';
import PrivateRoute from './PrivateRoute';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import PasswordRecoveryForm from '../features/auth/PasswordRecoveryForm';
import ResetPasswordForm from '../features/auth/ResetPasswordForm';

function AppRoutes() {
  return (
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
          <ProtectedRoute allowedRoles={['ADMINISTRADOR', 'CONDUCTOR']}>
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
        <Route path="" element={<Navigate to="/logged-in/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;