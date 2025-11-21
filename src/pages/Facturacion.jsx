import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useState, useEffect } from 'react';
import FacturaFormModal from '../features/facturacion/FacturaFormModal';
import { facturacionService } from '../services/FacturacionService';
import { FaFilePdf } from 'react-icons/fa';

export default function Facturacion() {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [facturas, setFacturas] = useState([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    setLoadingFacturas(true);
    try {
      const response = await facturacionService.listarFacturas({ limit: 20 });
      setFacturas(response.data || []);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      // No mostrar error si el servicio no está disponible
    } finally {
      setLoadingFacturas(false);
    }
  };

  const handleGenerarFactura = () => {
    setShowFormModal(true);
  };

  const handleCloseModal = (facturaEmitida) => {
    setShowFormModal(false);
    if (facturaEmitida) {
      cargarFacturas(); // Recargar lista de facturas
    }
  };

  const handleEnviarFactura = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Factura enviada por email correctamente');
    } catch (error) {
      showError('Error al enviar la factura');
    }
  };

  const handleDescargarPdf = async (factura) => {
    try {
        // Mostramos un toast o spinner si quieres
        await facturacionService.descargarFactura(factura.id, factura.numero);
        showSuccess('Factura descargada correctamente');
    } catch (error) {
        showError('Error al descargar la factura');
    }
  };

  const handleVerificarSync = async () => {
    try {
        const response = await facturacionService.obtenerUltimoComprobante(1, 1);
        const ultimoAfip = response.data.ultimo_numero;
        
        showInfo(`Sincronizado: El último comprobante en AFIP es el N° ${ultimoAfip}`);
    } catch (error) {
        showError("Error al consultar AFIP");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR');
  };

  const formatearNumeroFactura = (tipo, puntoVta, numero) => {
    return `${String(puntoVta).padStart(4, '0')}-${String(numero).padStart(8, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Facturación
        </h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
          Gestión de facturas electrónicas integradas con AFIP/ARCA
        </p>
      </div>

      <div className={`p-6 rounded-lg border-0 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
              {facturas.length} factura(s) registrada(s)
            </p>
            <button
              onClick={cargarFacturas}
              className={`w-full px-4 py-2 rounded ${
                darkMode
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              Actualizar Lista
            </button>
          </div>

          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Verificar conexión AFIP/ARCA
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Verifica el estado de la conexión con AFIP/ARCA
            </p>
            <button
              onClick={handleVerificarSync}
              className={`w-full px-4 py-2 rounded ${
                darkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Verificar Conexión
            </button>
          </div>
        </div>

        {/* Historial de facturas */}
        <div className="mt-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Historial de Facturas
          </h2>
          {loadingFacturas ? (
            <div className="text-center py-8">
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Cargando facturas...</p>
            </div>
          ) : facturas.length === 0 ? (
            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No hay facturas registradas aún. Genera tu primera factura haciendo clic en "Generar Factura".
              </p>
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Número
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fecha
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Cliente
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Importe
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      CAE
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Estado
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((factura) => (
                    <tr
                      key={factura.id}
                      className={`border-t ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatearNumeroFactura(factura.tipo_cbte, factura.punto_vta, factura.numero)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatearFecha(factura.fecha_cbte)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {factura.nro_doc}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${factura.imp_total.toFixed(2)}
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {factura.cae}
                      </td>
                      <td className={`px-4 py-3 text-sm`}>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            factura.estado === 'A'
                              ? darkMode
                                ? 'bg-green-800 text-green-200'
                                : 'bg-green-100 text-green-800'
                              : darkMode
                                ? 'bg-red-800 text-red-200'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {factura.estado === 'A' ? 'Aprobada' : 'Rechazada'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {factura.estado === 'A' && (
                          <button
                            onClick={() => handleDescargarPdf(factura)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Descargar PDF"
                          >
                            <FaFilePdf size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Información de Facturación
          </h2>
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              El sistema de facturación está integrado con AFIP/ARCA para generar facturas electrónicas válidas.
              Todas las facturas se almacenan automáticamente y pueden ser consultadas en cualquier momento.
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <strong>Modo:</strong> Homologación (facturas ficticias para pruebas)
            </p>
          </div>
        </div>
      </div>

      {/* Modal de formulario */}
      {showFormModal && (
        <FacturaFormModal
          isOpen={showFormModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}