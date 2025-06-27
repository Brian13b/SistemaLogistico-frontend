import { useState, useEffect, useRef } from 'react';
import Modal from '../../components/Modal';
import { viajesService } from '../../services/ViajesService';
import { conductoresService } from '../../services/ConductoresService';
import { vehiculosService } from '../../services/VehiculosService';
import { viajesDocumentosService } from '../../services/ViajesDocumentosService';
import { FaDownload, FaFileAlt, FaRoute, FaUser, FaCar } from 'react-icons/fa';
import { generateFichaPDF } from '../../utils/pdfGenerator';

function ViajeModal({ isOpen, onClose, viajeId, darkMode }) {
  const [viaje, setViaje] = useState(null);
  const [conductor, setConductor] = useState(null);
  const [vehiculo, setVehiculo] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setViaje(null);
      setConductor(null);
      setVehiculo(null);
      setDocumentos([]);
      setError(null);
      return;
    }
    
    if (isOpen && viajeId) {
      const fetchViajeData = async () => {
        try {
          setLoading(true);
          
          const viajeRes = await viajesService.getById(viajeId);
          setViaje(viajeRes.data);
          
          try {
            const documentosRes = await viajesDocumentosService.getAllByViaje(viajeId);
            setDocumentos(documentosRes.data);
          } catch (err) {
            console.error("Error al cargar documentos del viaje:", err);
            setError('Error al cargar los documentos del viaje');
          }

          if (viajeRes.data.conductor_id) {
            try {
              const conductorRes = await conductoresService.getById(viajeRes.data.conductor_id);
              setConductor(conductorRes.data);
            } catch (err) {
              console.error("Error al cargar conductor:", err);
            }
          }
          
          if (viajeRes.data.vehiculo_id) {
            try {
              const vehiculoRes = await vehiculosService.getById(viajeRes.data.vehiculo_id);
              setVehiculo(vehiculoRes.data);
            } catch (err) {
              console.error("Error al cargar vehículo:", err);
            }
          }
          
          setError(null);
          
        } catch (err) {
          setError('Error al cargar los datos del viaje');
        } finally {
          setLoading(false);
        }
      };

      fetchViajeData();
    }
  }, [isOpen, viajeId]);

  const handleGeneratePDF = async () => {
    generateFichaPDF('viaje', viaje, documentos, formatDate);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error en fecha';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles del Viaje" 
      darkMode={darkMode}
    >
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          <p className="ml-2">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      ) : viaje ? (
        <div className="space-y-6" ref={contentRef}>
          {/* Encabezado con información principal */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <FaRoute size={24} />
            </div>
            <h2 className="text-xl font-bold mb-1">{viaje.origen} → {viaje.destino}</h2>
            <div className="flex flex-wrap justify-center gap-4 mt-3">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Código</p>
                <p className="font-medium">{viaje.codigo || `VJ-${String(viajeId).padStart(4, '0')}`}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                <span className={`px-2 py-1 rounded text-sm ${
                  (viaje.estado === 'Completado') 
                    ? 'bg-green-100 text-green-800' 
                    : (viaje.estado === 'En progreso')
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {viaje.estado || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Información del viaje */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-3">Detalles del Viaje</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Salida</p>
                <p>{formatDate(viaje.fecha_salida)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Llegada</p>
                <p>{formatDate(viaje.fecha_llegada)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Origen</p>
                <p>{viaje.origen || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Destino</p>
                <p>{viaje.destino || 'No especificado'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Observaciones</p>
                <p className="whitespace-pre-line">{viaje.observaciones || 'Ninguna'}</p>
              </div>
            </div>
          </div>
          
          {/* Información del conductor */}
          {conductor && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <FaUser className="text-blue-500" />
                <h3 className="text-lg font-semibold">Conductor Asignado</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={conductor.foto || "https://picsum.photos/200"} 
                    alt="Foto del conductor"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                    <p>{conductor.nombre} {conductor.apellido}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">DNI</p>
                    <p>{conductor.dni}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Licencia</p>
                    <p>{conductor.numero_licencia || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p>{conductor.numero_contacto || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Información del vehículo */}
          {vehiculo && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <FaCar className="text-blue-500" />
                <h3 className="text-lg font-semibold">Vehículo Asignado</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Patente</p>
                  <p className="font-mono">{vehiculo.patente}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Marca</p>
                  <p>{vehiculo.marca || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Modelo</p>
                  <p>{vehiculo.modelo || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Año</p>
                  <p>{vehiculo.anio || 'No especificado'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Documentos */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <FaFileAlt className="text-blue-500" />
              <h3 className="text-lg font-semibold">Documento de Viaje</h3>
            </div>
            {documentos && documentos.length > 0 ? (
              <div className="grid grid-cols-1">
                {documentos.map((docViaje) => (
                  <div key={docViaje.id} className={`p-3 rounded border grid grid-cols-4 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Documento</p>
                      <p>{docViaje.tipo_documento || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nombre del Documento</p>
                      <p>{docViaje.archivo_nombre || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Número de Documento</p>
                      <p>{docViaje.codigo_documento || 'No especificado'}</p>
                    </div>

                    <div>
                      <a 
                        href={docViaje.archivo_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`px-4 py-2 rounded flex items-center gap-2 ${
                          darkMode 
                            ? 'bg-gray-800 hover:bg-gray-600 text-yellow-500' 
                            : 'bg-gray-200 hover:bg-gray-200 text-blue-600'
                        }`}>
                        <FaDownload /> Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay documentos disponibles</p>
            )}  
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              onClick={handleGeneratePDF}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-500' 
                  : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
              }`}
            >
              <FaDownload /> Descargar PDF
            </button>
            <button 
              onClick={onClose}
              className={`px-4 py-2 rounded ${
                darkMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <p>No se encontraron datos del viaje</p>
      )}
    </Modal>
  );
}

export default ViajeModal;