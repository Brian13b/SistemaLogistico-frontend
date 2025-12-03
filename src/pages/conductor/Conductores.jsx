import { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/common/DataTable';
import { conductoresService } from '../../services/ConductoresService';
import ConductorModal from '../../features/conductores/ConductoresModal';
import ConductorNuevoModal from '../../features/conductores/ConductorNuevoModal';
import DocumentoConductorModal from '../../features/conductores/DocumentoConductorModal';
import { FaPlus, FaEdit, FaEye, FaFile, FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { useTableControls } from '../../hooks/useTableControls';
import { Pagination } from '../../components/common/Paginacion';
import { AdvancedFilters } from '../../components/common/FiltrosAvanzados';
import { useTheme } from '../../context/ThemeContext';

function Conductores() {
  const { darkMode } = useTheme();

  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [documentosModalOpen, setDocumentosModalOpen] = useState(false);
  const [selectedConductorId, setSelectedConductorId] = useState(null);
  const [selectedConductorNombre, setSelectedConductorNombre] = useState('');

  // Filtros y paginación
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    paginaActual,
    setPaginaActual,
    showAdvancedFilters,
    setShowAdvancedFilters,
    resetFilters,
    filteredData,
    paginateData
  } = useTableControls({
    dni: '',
    nombre: '',
    apellido: '',
    telefono: '',
    estado: ''
  }, 5);

  // Configuración de filtros
  const filterConfig = [
    { name: 'dni', label: 'DNI' },
    { name: 'nombre', label: 'Nombre' },
    { name: 'apellido', label: 'Apellido' },
    { name: 'telefono', label: 'Teléfono' },
    { name: 'estado', label: 'Estado' }
  ];
  
  const fetchConductores = async () => {
    try {
      setLoading(true);

      const response = await conductoresService.getAll();
      setConductores(response.data);

      setError(null);
    } catch (err) {
      setError("Error al cargar la lista de conductores");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConductores();
  }, []);

  const conductoresData = useMemo(() => {
    return conductores.map(conductor => {
      return {
        id: conductor.id,
        codigo: conductor.codigo || `C-${String(conductor.id).padStart(3, '0')}`,
        dni: conductor.dni,
        nombre: `${conductor.nombre} ${conductor.apellido}`,
        telefono: conductor.numero_contacto,
        estado: conductor.estado,
        acciones: (
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedConductorId(conductor.id);
                setSelectedConductorNombre(`${conductor.nombre} ${conductor.apellido}`);
                setEditModalOpen(true);
              }} 
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              title="Editar"
            >
              <FaEdit size={16} className={darkMode ? 'text-yellow-500' : 'text-blue-600'} />
            </button>
            <button 
              onClick={() => {
                setSelectedConductorId(conductor.id);
                setViewModalOpen(true);
                setSelectedConductorNombre(`${conductor.nombre} ${conductor.apellido}`);
              }} 
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              title="Ver detalles"
            >
              <FaEye size={16} className={darkMode ? 'text-yellow-500' : 'text-blue-600'} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedConductorId(conductor.id);
                setSelectedConductorNombre(`${conductor.nombre} ${conductor.apellido}`);
                setDocumentosModalOpen(true);
              }} 
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              title="Gestionar Documentos"
            >
              <FaFile size={16} className={darkMode ? 'text-yellow-500' : 'text-blue-600'} />
            </button>
          </div>
        )
      };
    }).sort((a, b) => a.id - b.id);
  }, [conductores, darkMode]);

  // Aplicar filtros y paginación
  const filteredConductores = filteredData(conductoresData);
  const { paginatedData: currentConductores, totalPaginas, totalItems } = paginateData(filteredConductores);

  const handleNewConductorClick = () => {
    setSelectedConductorId(null);
    setEditModalOpen(true);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    setPaginaActual(1);
  };

  const handleApplyFilters = () => {
    setShowAdvancedFilters(false);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Conductores</h1>
        <button 
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white'
          }`} 
          onClick={handleNewConductorClick}
        >
          <FaPlus /> Nuevo Conductor
        </button>
      </div>

      {/* Filtros de búsqueda */}
      <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex items-center justify-between">
          <div className={`relative flex-grow max-w-md ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            <FaSearch className={`absolute left-3 top-3 ${darkMode ? 'text-white' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Buscar conductores..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPaginaActual(1);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Botón para mostrar/ocultar filtros avanzados */}
          <div className="relative ml-4">
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } ${
                Object.values(filters).some(filter => filter !== '') ? 
                  (darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-100 text-blue-800') : ''
              }`}
            >
              <FaFilter/>
              Filtros avanzados
            </button>
            
            <AdvancedFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              onApply={handleApplyFilters}
              show={showAdvancedFilters}
              darkMode={darkMode}
              filterConfig={filterConfig}
            />
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden mb-6 shadow-md`}>
        {loading ? (
          <div className="p-4 flex justify-center">
            <p>Cargando...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <DataTable 
              darkMode={darkMode}
              columns={[
                { header: 'Código', accessor: 'codigo'},
                { header: 'DNI', accessor: 'dni' },
                { header: 'Nombre y Apellido', accessor: 'nombre' },
                { header: 'Teléfono', accessor: 'telefono' },
                { header: 'Estado', accessor: 'estado' },
                { header: 'Acciones', accessor: 'acciones' }
              ]}
              data={currentConductores}
              onRowClick={(conductor) => {
                setSelectedConductorId(conductor.id);
                setSelectedConductorNombre(`${conductor.nombre} ${conductor.apellido}`);
                setViewModalOpen(true);
              }}
            />

            <Pagination
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={setPaginaActual}
              darkMode={darkMode}
              currentItems={currentConductores}
              totalItems={totalItems}
            />
          </>
        )}
      </div>

      <ConductorModal 
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        conductorId={selectedConductorId}
        darkMode={darkMode}
      />

      <ConductorNuevoModal 
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          fetchConductores();
        }}
        conductorId={selectedConductorId}
        darkMode={darkMode}
      />
      
      <DocumentoConductorModal 
        isOpen={documentosModalOpen}
        onClose={() => {
          setDocumentosModalOpen(false);
          fetchConductores();
        }}
        conductorId={selectedConductorId}
        conductorNombre={selectedConductorNombre}
        darkMode={darkMode}
      />
    </div>
  );
}

export default Conductores;