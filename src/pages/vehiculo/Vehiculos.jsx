import { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/common/DataTable';
import { vehiculosService } from '../../services/VehiculosService';
import VehiculoModal from '../../features/vehiculos/VehiculosModal';
import VehiculoNuevoModal from '../../features/vehiculos/VehiculoNuevoModal';
import VehiculoDocumentosModal from '../../features/vehiculos/DocumentoVehiculosModal';
import { FaPlus, FaEdit, FaEye, FaFile, FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { useTableControls } from '../../hooks/useTableControls';
import { Pagination } from '../../components/common/Paginacion';
import { AdvancedFilters } from '../../components/common/FiltrosAvanzados';

function Vehiculos({ darkMode }) {
  // Estados para datos
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [documentosModalOpen, setDocumentosModalOpen] = useState(false);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState(null);

  // Filtros y paginación con hook personalizado
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
    marca: '',
    modelo: '',
    patente: '',
    tipo: '',
    estado: ''
  }, 5);

  // Configuración de filtros avanzados
  const filterConfig = [
    { name: 'marca', label: 'Marca' },
    { name: 'modelo', label: 'Modelo' },
    { name: 'patente', label: 'Patente' },
    { name: 'tipo', label: 'Tipo' },
    { name: 'estado', label: 'Estado' }
  ];

  // Obtener datos de vehículos
  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      const response = await vehiculosService.getAll();
      setVehiculos(response.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar la lista de vehículos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  // Formatear datos para la tabla
  const vehiculosData = useMemo(() => {
    return vehiculos.map(vehiculo => ({
      id: vehiculo.id,
      codigo: vehiculo.codigo || `VC-${String(vehiculo.id).padStart(3, '0')}`,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      marcaModelo: `${vehiculo.marca} ${vehiculo.modelo}`,
      patente: vehiculo.patente,
      tipo: vehiculo.tipo,
      estado: vehiculo.estado,
      acciones: (
        <div className="flex items-center space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedVehiculoId(vehiculo.id);
              setEditModalOpen(true);
            }} 
            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Editar"
          >
            <FaEdit size={16} className={darkMode ? 'text-yellow-500' : 'text-blue-600'} />
          </button>
          <button 
            onClick={() => {
              setSelectedVehiculoId(vehiculo.id);
              setViewModalOpen(true);
            }} 
            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Ver detalles"
          >
            <FaEye size={16} className={darkMode ? 'text-yellow-500' : 'text-blue-600'} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedVehiculoId(vehiculo.id);
              setDocumentosModalOpen(true);
            }} 
            className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Gestionar Documentos"
          >
            <FaFile size={16} className={darkMode ? 'text-yellow-500' : 'text-blue-600'} />
          </button>
        </div>
      )
    })).sort((a, b) => a.id - b.id);
  }, [vehiculos, darkMode]);

  // Aplicar filtros y paginación
  const filteredVehiculos = filteredData(vehiculosData);
  const { paginatedData: currentVehiculos, totalPaginas, totalItems } = paginateData(filteredVehiculos);

  // Handlers
  const handleNewVehiculoClick = () => {
    setSelectedVehiculoId(null);
    setEditModalOpen(true);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  };

  const handleApplyFilters = () => {
    setShowAdvancedFilters(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Vehículos</h1>
        <button 
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white'
          }`} 
          onClick={handleNewVehiculoClick}
        >
          <FaPlus /> Nuevo Vehiculo
        </button>
      </div>
      
      {/* Filtros */}
      <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex justify-between items-center">
          {/* Barra de búsqueda integrada */}
          <div className={`relative flex-grow max-w-md ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            <FaSearch className={`absolute left-3 top-3 ${darkMode ? 'text-white' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Buscar vehículos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
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
              <FaFilter />
              Filtros Avanzados
            </button>

            <AdvancedFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
              onApply={handleApplyFilters}
              onClose={() => setShowAdvancedFilters(false)}
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
          <p className="p-4 flex justify-center">Cargando...</p>
        ) : error ? (
          <p className="p-4 text-red-500">{error}</p>
        ) : (
          <>
            <DataTable 
              darkMode={darkMode}
              columns={[
                { header: 'Código', accessor: 'codigo' },
                { header: 'Marca y Modelo', accessor: 'marcaModelo' },
                { header: 'Patente', accessor: 'patente' },
                { header: 'Tipo', accessor: 'tipo' },
                { header: 'Estado', accessor: 'estado' },
                { header: 'Acciones', accessor: 'acciones' }
              ]}
              data={currentVehiculos}
              onRowClick={(vehiculo) => {
                setSelectedVehiculoId(vehiculo.id);
                setViewModalOpen(true);
              }}
            />
            
            <Pagination 
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={setPaginaActual}
              darkMode={darkMode}
              totalItems={totalItems}
              currentItems={currentVehiculos}
            />
          </>
        )}
      </div>
      
      {/* Modales */}
      <VehiculoModal 
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        vehiculoId={selectedVehiculoId}
        darkMode={darkMode}
      />

      <VehiculoNuevoModal 
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          fetchVehiculos();
        }}
        vehiculoId={selectedVehiculoId}
        darkMode={darkMode}
      />

      <VehiculoDocumentosModal 
        isOpen={documentosModalOpen}
        onClose={() => {
          setDocumentosModalOpen(false);
          fetchVehiculos();
        }}
        vehiculoId={selectedVehiculoId}
        darkMode={darkMode}
      />
    </div>
  );
}

export default Vehiculos;