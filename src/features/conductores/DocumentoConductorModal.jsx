import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { conductorDocumentosService } from "../../services/ConductorDocumentosServices";
import { FaUpload, FaTrash } from "react-icons/fa";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function DocumentoConductorModal({isOpen, onClose, conductorId, conductorNombre, darkMode}) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    codigo_documento: "",
    id_conductor: conductorId,
    tipo_documento: "",
    fecha_emision: "",
    fecha_vencimiento: "",
    esta_activo: true,
  });
  const [file, setFile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        codigo_documento: "",
        id_conductor: conductorId,
        tipo_documento: "",
        fecha_emision: "",
        fecha_vencimiento: "",
        esta_activo: true,
      });
      fetchDocumentos();
    } else {
      setDocumentos([]);
    }
  }, [isOpen, conductorId]);

  const fetchDocumentos = async () => {
    if (!conductorId) return;

    try {
      setLoading(true);
      const response = await conductorDocumentosService.getAllByConductor(conductorId);

      const filteredDocumentos = conductorId
        ? response.data.filter((doc) => doc.id_conductor === conductorId)
        : response.data;

      setDocumentos(filteredDocumentos);
      setError(null);
    } catch (err) {
      setError(`Error al cargar los documentos: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Por favor seleccione un archivo");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("documento_data", JSON.stringify(formData));
      uploadData.append("archivo", file);

      const response = await conductorDocumentosService.create(uploadData);

      setUploading(false);

      setFormData({
        codigo_documento: "",
        id_conductor: conductorId,
        tipo_documento: "",
        fecha_emision: "",
        fecha_vencimiento: "",
        esta_activo: true,
      });
      setFile(null);

      fetchDocumentos();
    } catch (error) {
      setUploading(false);
      setError(`Error al subir el documento: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDownload = async (documentoId) => {
    try {
      // Hacer solicitud para descargar archivo
      const response = await conductorDocumentosService.download(documentoId);

      // Crear URL de objeto para la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Encontrar el nombre del archivo
      const documento = documentos.find((doc) => doc.id === documentoId);
      const fileName = documento?.archivo_nombre || "documento.pdf";

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Limpieza
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      setError("Error al descargar el documento");
    }
  };

  const requestDelete = (documentoId) => {
    setDocToDelete(documentoId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await conductorDocumentosService.delete(docToDelete);
      fetchDocumentos();
    } catch (err) {
      setError("Error al eliminar el documento");
    } finally {
      setConfirmOpen(false);
      setDocToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-AR");
    } catch (error) {
      return "Error en fecha";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Documentos del Conductor: ${conductorNombre}`}
      darkMode={darkMode}
    >
      <div className="space-y-6">
        {/* Formulario de carga */}
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <h3 className="text-lg font-semibold mb-3">Cargar Nuevo Documento</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Código del Documento
                </label>
                <input
                  type="text"
                  name="codigo_documento"
                  value={formData.codigo_documento}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded border ${
                    darkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Documento
                </label>
                <select
                  name="tipo_documento"
                  value={formData.tipo_documento}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded border ${
                    darkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                  required
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="DNI">DNI</option>
                  <option value="Licencia de Conducir">Licencia de Conducir</option>
                  <option value="Certificado Médico">Certificado Médico</option>
                  <option value="Curso de Manejo">Curso de Manejo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Esta Activo?
                </label>
                <select
                  name="esta_activo"
                  value={formData.esta_activo}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded border ${
                    darkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                  required
                >
                  <option value={true}>Sí</option>
                  <option value={false}>No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Archivo
                </label>
                <input
                  type="file"
                  id="archivo"
                  onChange={handleFileChange}
                  className={`w-full p-2 rounded border ${
                    darkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de Emisión
                </label>
                <input
                  type="date"
                  name="fecha_emision"
                  value={formData.fecha_emision}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded border ${
                    darkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={formData.fecha_vencimiento}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded border ${
                    darkMode
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  darkMode
                    ? "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <FaUpload /> Subir Documento
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de documentos */}
        <div
          className={`p-4 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <h3 className="text-lg font-semibold mb-3">Documentos del Conductor</h3>

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
              <p className="ml-2">Cargando documentos...</p>
            </div>
          ) : documentos && documentos.length > 0 ? (
            <div className="overflow-x-auto">
              <table
                className={`min-w-full ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                <thead className={darkMode ? "bg-gray-800" : "bg-gray-200"}>
                  <tr>
                    <th className="py-2 px-4 text-left">Código</th>
                    <th className="py-2 px-4 text-left">Tipo</th>
                    <th className="py-2 px-4 text-left">Emisión</th>
                    <th className="py-2 px-4 text-left">Vencimiento</th>
                    <th className="py-2 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((doc) => (
                    <tr
                      key={doc.id}
                      className={
                        darkMode
                          ? "border-t border-gray-700"
                          : "border-t border-gray-300"
                      }
                    >
                      <td className="py-3 px-4">{doc.codigo_documento || `DOC-${String(doc.id).padStart(4, "0")}`}</td>
                      <td className="py-3 px-4">{doc.tipo_documento}</td>
                      <td className="py-3 px-4">{formatDate(doc.fecha_emision)}</td>
                      <td className="py-3 px-4">{formatDate(doc.fecha_vencimiento)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleDownload(doc.id)}
                            className={`p-1 rounded ${
                              darkMode
                                ? "hover:bg-gray-600 text-yellow-500"
                                : "hover:bg-gray-200 text-blue-600"
                            }`}
                            title="Descargar"
                          >
                            <FaUpload
                              size={16}
                              className="transform rotate-180"
                            />
                          </button>
                          <button
                            onClick={() => requestDelete(doc.id)}
                            className={`p-1 rounded ${
                              darkMode
                                ? "hover:bg-gray-600 text-red-500"
                                : "hover:bg-gray-200 text-red-600"
                            }`}
                            title="Eliminar"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4 italic">
              No hay documentos disponibles para este conductor
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${
              darkMode
                ? "bg-gray-600 hover:bg-gray-500"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            Cerrar
          </button>
        </div>
        
        <ConfirmDialog
          isOpen={confirmOpen}
          title="Confirmar eliminación"
          message={`¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmOpen(false)}
          darkMode={darkMode}
        />
      </div>
    </Modal>
  );
}

export default DocumentoConductorModal;