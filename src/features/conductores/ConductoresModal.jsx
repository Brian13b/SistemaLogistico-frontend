import { useState, useEffect, useRef } from 'react';
import Modal from '../../components/Modal';
import { conductoresService } from '../../services/ConductoresService';
import { conductorDocumentosService } from '../../services/ConductorDocumentosServices';
import { FaDownload, FaFileAlt, FaUser } from 'react-icons/fa';
import { generateFichaPDF } from '../../utils/pdfGenerator';

function ConductorModal({ isOpen, onClose, conductorId, darkMode }) {
  const [conductor, setConductor] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setConductor(null);
      setDocumentos([]);
      setError(null);
      return;
    }
    
    if (isOpen && conductorId) {
      const fetchConductorData = async () => {
        try {
          setLoading(true);
          
          const conductorRes = await conductoresService.getById(conductorId);
          setConductor(conductorRes.data);
          
          try {
            const documentosRes = await conductorDocumentosService.getAllByConductor(conductorId);
            setDocumentos(documentosRes.data);
          } catch(err) {
            setError('Error al cargar los documentos del conductor');
          }
          
          setError(null);
          
        } catch (err) {
          setError('Error al cargar los datos del conductor');
        } finally {
          setLoading(false);
        }
      };

      fetchConductorData();
    }
  }, [isOpen, conductorId]);
  
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
      return 'Error en fecha';
    }
  };

  const handleGeneratePDF = async () => {
    generateFichaPDF('conductor', conductor, documentos, formatDate);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles del Conductor" 
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
      ) : conductor ? (
        <div className="space-y-6" ref={contentRef}>
          {/* Encabezado con foto e información principal */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex-shrink-0">
              <img
                src={conductor.foto || "https://picsum.photos/200"} 
                alt="Foto del conductor"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-1">{conductor.nombre} {conductor.apellido}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">DNI</p>
                  <p className="font-medium">{conductor.dni}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Código</p>
                  <p className="font-medium">{conductor.codigo || `C-${String(conductorId).padStart(3, '0')}`}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    (conductor.estado === 'Activo' || conductor.estado === 'ACTIVO') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    { conductor.estado || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Información de contacto */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <FaUser className="text-blue-500" />
              <h3 className="text-lg font-semibold">Información de Contacto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                <p>{conductor.numero_contacto || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p>{conductor.email_contacto || 'No especificado'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                <p>{conductor.direccion || 'No especificada'}</p>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <FaFileAlt className="text-blue-500" />
              <h3 className="text-lg font-semibold">Documentos</h3>
            </div>
            {documentos && documentos.length > 0 ? (
              <div className="grid grid-cols-1">
                {documentos.map(doc => (
                  <div key={doc.id} className={`p-3 rounded border flex items-center justify-between ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Documento</p>
                      <p>{doc.tipo_documento || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nombre del Documento</p>
                      <p>{doc.archivo_nombre || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Número de Documento</p>
                      <p>{doc.codigo_documento || 'No especificado'}</p>
                    </div>

                    <div>
                      <a 
                        href={doc.archivo_url} 
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
          
          {/* Botones */}
          <div className="flex justify-end space-x-4 mt-6">
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
        <p>No se encontraron datos del conductor</p>
      )}
    </Modal>
  );
}

export default ConductorModal;