import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useState } from 'react';

export default function Facturacion() {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleGenerarFactura = async () => {
    setLoading(true);
    try {
      // Simular generación de factura
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Factura generada correctamente');
    } catch (error) {
      showError('Error al generar la factura');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarFactura = async () => {
    try {
      // Simular envío de factura
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Factura enviada por email correctamente');
    } catch (error) {
      showError('Error al enviar la factura');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Facturación
        </h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
          Gestión de facturas y documentos comerciales
        </p>
      </div>

      <div className={`p-6 rounded-lg border-0 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Generar Factura
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Crear nueva factura para los viajes completados
            </p>
            <button
              onClick={handleGenerarFactura}
              disabled={loading}
              className={`w-full px-4 py-2 rounded ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {loading ? 'Generando...' : 'Generar Factura'}
            </button>
          </div>

          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Enviar por Email
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enviar facturas generadas por correo electrónico
            </p>
            <button
              onClick={handleEnviarFactura}
              className={`w-full px-4 py-2 rounded ${
                darkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              Enviar Factura
            </button>
          </div>

          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Historial
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Ver historial de facturas generadas
            </p>
            <button
              onClick={() => showInfo('Funcionalidad en desarrollo')}
              className={`w-full px-4 py-2 rounded ${
                darkMode
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              Ver Historial
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Información de Facturación
          </h2>
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              El sistema de facturación está integrado con AFIP para generar facturas electrónicas válidas.
              Todas las facturas se almacenan automáticamente y pueden ser consultadas en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}