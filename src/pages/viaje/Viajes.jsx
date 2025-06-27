import { useState, useEffect, useMemo } from 'react';
import DataTable from '../../components/common/DataTable';
import { viajesService } from '../../services/ViajesService';
import { conductoresService } from '../../services/ConductoresService';
import { vehiculosService } from '../../services/VehiculosService';
import ViajeModal from '../../features/viajes/ViajesModal';
import { FaPlus, FaEdit, FaEye, FaFile, FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import ViajeNuevoModal from '../../features/viajes/ViajeNuevoModal';
import ViajesDocumentosModal from '../../features/viajes/DocumentoViajesModal';
import { useTableControls } from '../../hooks/useTableControls';
import { Pagination } from '../../components/common/Paginacion';
import { AdvancedFilters } from '../../components/common/FiltrosAvanzados';

function Viajes({ darkMode }) {
  // Estados para datos
  const [viajes, setViajes] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [documentosModalOpen, setDocumentosModalOpen] = useState(false);
  const [selectedViajeId, setSelectedViajeId] = useState(null);
  const [selectedViajeInfo, setSelectedViajeInfo] = useState('');

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
    origen: '',
    destino: '',
    conductor: '',
    vehiculo: '',
    estado: ''
  }, 5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [viajesRes, conductoresRes, vehiculosRes] = await Promise.all([
          viajesService.getAll(),
          conductoresService.getAll(),
          vehiculosService.getAll()
        ]);
        
        setViajes(viajesRes.data);
        setConductores(conductoresRes.data);
        setVehiculos(vehiculosRes.data);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Configuración de filtros avanzados
  const filterConfig = [
    { name: 'origen', label: 'Origen' },
    { name: 'destino', label: 'Destino' },
    { name: 'conductor', label: 'Conductor' },
    { name: 'vehiculo', label: 'Vehículo' },
    { name: 'estado', label: 'Estado' }
  ];

  // Función para formatear datos de viajes
  const viajesData = useMemo(() => {
    const getConductorInfo = (conductorId) => {
      if (!conductorId) return null;
      return conductores.find(c => c.id === conductorId);
    };

    const getVehiculoInfo = (vehiculoId) => {
      if (!vehiculoId) return null;
      return vehiculos.find(v => v.id === vehiculoId);
    };

    const formatFecha = (fecha) => {
      if (!fecha) return 'N/A';
      const date = new Date(fecha);
      return date.toLocaleDateString('es-AR');
    };

    return viajes.map(viaje => {
      const conductor = getConductorInfo(viaje.conductor_id);
      const vehiculo = getVehiculoInfo(viaje.vehiculo_id);

      return {
        id: viaje.id,
        codigo: viaje.codigo || `VJ-${String(viaje.id).padStart(4, '0')}`,
        origen: viaje.origen,
        destino: viaje.destino,
        fechaInicio: formatFecha(viaje.fecha_salida),
        fechaFin: formatFecha(viaje.fecha_llegada),
        conductor: conductor ? `${conductor.nombre} ${conductor.apellido}` : 'Sin asignar',
        vehiculo: vehiculo ? vehiculo.patente : 'Sin asignar',
        estado: viaje.estado,
        acciones: (
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedViajeId(viaje.id);
                setSelectedViajeInfo(`Viaje ${viaje.origen} - ${viaje.destino}`);
                setEditModalOpen(true);
              }} 
              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              title="Editar"
            >
              <FaEdit size={16} className={darkMode ? 'text-yellow-500' : 'text-blue-600'} />
            </button>
            <button 
              onClick={() => {
                setSelectedViajeId(viaje.id);
                setSelectedViajeInfo(`Viaje ${viaje.origen} - ${viaje.destino}`);
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
                setSelectedViajeId(viaje.id);
                setSelectedViajeInfo(`Viaje ${viaje.origen} - ${viaje.destino}`);
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
  }, [viajes, conductores, vehiculos, darkMode]);

  // Aplicar filtros y paginación
  const filteredViajes = filteredData(viajesData);
  const { paginatedData: currentViajes, totalPaginas, totalItems } = paginateData(filteredViajes);

  // Handlers
  const handleNewViajeClick = () => {
    setSelectedViajeId(null);
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
        <h1 className="text-2xl font-bold">Gestión de Viajes</h1>
        <button 
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white'
          }`} 
          onClick={handleNewViajeClick}
        >
          <FaPlus /> Nuevo Viaje
        </button>
      </div>
      
      {/* Filtros */}
      <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex justify-between items-center">
          <div className={`relative flex-grow max-w-md ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            <FaSearch className={`absolute left-3 top-3 ${darkMode ? 'text-white' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Buscar viajes..."
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
              Filtros avanzados
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
                { header: 'Origen', accessor: 'origen' },
                { header: 'Destino', accessor: 'destino' },
                { header: 'Salida', accessor: 'fechaInicio' },
                { header: 'LLegada', accessor: 'fechaFin' },
                { header: 'Conductor', accessor: 'conductor' },
                { header: 'Vehículo', accessor: 'vehiculo' },
                { header: 'Estado', accessor: 'estado' },
                { header: 'Acciones', accessor: 'acciones' }
              ]}
              data={currentViajes}
              onRowClick={(viaje) => {
                setSelectedViajeId(viaje.id);
                setSelectedViajeInfo(`Viaje ${viaje.origen} - ${viaje.destino}`);
                setViewModalOpen(true);
              }}
            />
            
            <Pagination 
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              onPageChange={setPaginaActual}
              darkMode={darkMode}
              currentItems={currentViajes}
              totalItems={totalItems}
            />
          </>
        )}
      </div>

      {/* Modales */}
      <ViajeModal 
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        viajeId={selectedViajeId}
        darkMode={darkMode}
      />

      <ViajeNuevoModal 
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          fetchData();
        }}
        viajeId={selectedViajeId}
        darkMode={darkMode}
      />

      <ViajesDocumentosModal 
        isOpen={documentosModalOpen}
        onClose={() => {
          setDocumentosModalOpen(false);
          fetchData();
        }}
        viajeId={selectedViajeId}
        viajeInfo={selectedViajeInfo}
        darkMode={darkMode}
      />
    </div>
  );
}

export default Viajes;