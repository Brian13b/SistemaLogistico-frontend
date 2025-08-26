import { useState, useEffect, useRef } from 'react';
import Modal from '../../components/Modal';
import { vehiculosService } from '../../services/VehiculosService';
import { vehiculoDocumentosService } from '../../services/VehiculoDocumentosServices';
import { FaDownload } from 'react-icons/fa';
import { generateFichaPDF } from '../../utils/pdfGenerator';

function VehiculoModal({ isOpen, onClose, vehiculoId, darkMode }) {
  const [vehiculo, setVehiculo] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setVehiculo(null);
      setDocumentos([]);
      setError(null);
      return;
    }

    if (isOpen && vehiculoId) {
      const fetchVehiculoData = async () => {
        try {
          setLoading(true);

          const response = await vehiculosService.getById(vehiculoId);
          setVehiculo(response.data);

          try {
            const documentosResponse = await vehiculoDocumentosService.getAllByVehiculo(vehiculoId);
            setDocumentos(documentosResponse.data);
          }
          catch (err) {
            setError('Error al cargar los documentos del vehículo');
          }

          setError(null);

        } catch (err) {
          setError('Error al cargar los datos del vehículo');
        } finally {
          setLoading(false);
        }
      };

      fetchVehiculoData();
    }
  }, [isOpen, vehiculoId]);

  const handleDownload = async (documentoId, nombre) => {
    try {
      const nombreArchivo = nombre || `documento-${documentoId}`;
      const nombreConExtension = `${nombreArchivo}.pdf`;
  
      const response = await fetch(`/api/documentos_vehiculos/${documentoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!response.ok) throw new Error('Error al descargar el documento');
  
      const contentType = response.headers.get('content-type');
      const blob = await response.blob();

      const url = window.URL.createObjectURL(new Blob([blob], { type: contentType }));

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = nombreConExtension; 
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando documento:', error);
    }
  };

  const handleGeneratePDF = async () => {
    generateFichaPDF('vehiculo', vehiculo, documentos, formatDate);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-AR');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error en fecha';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles del Vehículo" 
      darkMode={darkMode}
    >
      {loading ? (
        <div className="flex justify-center p-6">
          <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900'></div> 
          <p>Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      ) : vehiculo ? (
        <div className="space-y-6" ref={contentRef}>
          {/* Encabezado con foto e información principal */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-1">{vehiculo.marca} {vehiculo.modelo}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Codigo</p>
                  <p>{vehiculo.codigo || `VC-${String(conductorId).padStart(3, '0')}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    (vehiculo.estado === 'ACTIVO') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vehiculo.estado || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del vehículo */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-3">Información del Vehículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Marca</p>
                <p>{vehiculo.marca || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modelo</p>
                <p>{vehiculo.modelo || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Patente</p>
                <p>{vehiculo.patente || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
                <p>{vehiculo.tipo || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Año</p>
                <p>{vehiculo.anio}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kilometraje</p>
                <p>{vehiculo.kilometraje}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tara</p>
                <p>{vehiculo.tara}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Carga maxima</p>
                <p>{vehiculo.carga_maxima}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Alta</p>
                <p>{formatDate(vehiculo.fecha_alta)}</p>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-semibold mb-3">Documentos del Vehiculo</h3>
            {documentos && documentos.length > 0 ? (
              <div className="grid grid-cols-1">
                {documentos.map((docVehiculo) => (
                  <div key={docVehiculo.id} className={`p-3 rounded border grid grid-cols-4 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Documento</p>
                      <p>{docVehiculo.tipo_documento || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nombre del Documento</p>
                      <p>{docVehiculo.archivo_nombre || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Número de Documento</p>
                      <p>{docVehiculo.codigo_documento || 'No especificado'}</p>
                    </div>

                    <div>
                      <a 
                        href={docVehiculo.archivo_url} 
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
            {/* Ejemplo de botones de acción */}
            <button 
              onClick={handleGeneratePDF}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-500' 
                  : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
              }`}
            >
              <FaDownload /> Descargar Ficha
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
        <p>No se encontraron datos del vehículo.</p>
      )}
    </Modal>
  );
}

export default VehiculoModal;