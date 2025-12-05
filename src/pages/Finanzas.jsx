import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { finanzasService } from '../services/finanzasService';
import { vehiculosService } from '../services/VehiculosService';
import { conductoresService } from '../services/ConductoresService';

import GastoFormModal from '../features/finanzas/GastoFormModal';
import IngresoFormModal from '../features/finanzas/IngresoFormModal';
import { Pagination } from '../components/common/Paginacion';

import { useTableControls } from '../hooks/useTableControls';
import { FaPlus, FaMinus, FaFileInvoice, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

function Finanzas() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [movimientos, setMovimientos] = useState([]);
  
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  
  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [modalIngresoOpen, setModalIngresoOpen] = useState(false);

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
    paginateData 
  } = useTableControls({
    fechaDesde: '',
    fechaHasta: '',
    vehiculo: '',
    conductor: '',
    tipo_movimiento: ''
  }, 10); 

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [gastosRes, ingresosRes] = await Promise.all([
        finanzasService.obtenerGastos(),
        finanzasService.obtenerIngresos()
      ]);

      const [vehiRes, condRes] = await Promise.all([
        vehiculosService.getAll(),
        conductoresService.getAll()
      ]);

      setVehiculos(vehiRes.data || []);
      setConductores(condRes.data || []);

      const listaGastos = (gastosRes.data || []).map(g => ({
        ...g,
        tipo_movimiento: 'EGRESO',
        categoria: g.tipo_gasto,
        vehiculo_id: g.vehiculo_id?.toString() || '',
        conductor_id: g.conductor_id?.toString() || '',
        descripcion_search: (g.nombre || g.descripcion || '').toLowerCase()
      }));

      const listaIngresos = (ingresosRes.data || []).map(i => ({
        ...i,
        tipo_movimiento: 'INGRESO',
        categoria: i.tipo_ingreso,
        vehiculo_id: '', 
        conductor_id: '',
        descripcion_search: (i.descripcion || '').toLowerCase()
      }));

      const todos = [...listaGastos, ...listaIngresos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMovimientos(todos);
      setError(null);

    } catch (err) {
      console.error("Error cargando finanzas", err);
      setError("Error al cargar los movimientos financieros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const movimientosProcesados = useMemo(() => {
    return movimientos.filter(mov => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!mov.descripcion_search.includes(term) && 
            !mov.categoria.toLowerCase().includes(term) &&
            !mov.monto.toString().includes(term)) {
          return false;
        }
      }

      if (filters.fechaDesde && new Date(mov.fecha) < new Date(filters.fechaDesde)) return false;
      if (filters.fechaHasta && new Date(mov.fecha) > new Date(filters.fechaHasta)) return false;
      if (filters.vehiculo && mov.vehiculo_id !== filters.vehiculo) return false;
      if (filters.conductor && mov.conductor_id !== filters.conductor) return false;
      if (filters.tipo_movimiento && mov.tipo_movimiento !== filters.tipo_movimiento) return false;

      return true;
    });
  }, [movimientos, searchTerm, filters]);

  const { paginatedData: currentItems, totalPaginas, totalItems } = paginateData(movimientosProcesados);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Caja y Finanzas</h1>
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded flex items-center gap-2 ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            onClick={() => setModalGastoOpen(true)}
          >
            <FaMinus className="text-xs" /> Gasto
          </button>
          <button 
            className={`px-4 py-2 rounded flex items-center gap-2 ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            onClick={() => setModalIngresoOpen(true)}
          >
            <FaPlus className="text-xs" /> Ingreso
          </button>
        </div>
      </div>

      <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex justify-between items-center">
          <div className={`relative flex-grow max-w-md ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            <FaSearch className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Buscar movimientos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPaginaActual(1);
              }}
              className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="relative ml-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } ${
                Object.values(filters).some(f => f !== '') 
                  ? (darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-100 text-blue-800') 
                  : ''
              }`}
            >
              <FaFilter />
              Filtros Avanzados
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
            <div>
               <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Desde</label>
               <input type="date" name="fechaDesde" value={filters.fechaDesde} onChange={handleFilterChange} className={`w-full text-sm rounded border px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div>
               <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hasta</label>
               <input type="date" name="fechaHasta" value={filters.fechaHasta} onChange={handleFilterChange} className={`w-full text-sm rounded border px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            </div>
            <div>
               <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tipo</label>
               <select name="tipo_movimiento" value={filters.tipo_movimiento} onChange={handleFilterChange} className={`w-full text-sm rounded border px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                  <option value="">Todos</option>
                  <option value="INGRESO">Ingresos</option>
                  <option value="EGRESO">Egresos</option>
               </select>
            </div>
            <div>
               <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vehículo</label>
               <select name="vehiculo" value={filters.vehiculo} onChange={handleFilterChange} className={`w-full text-sm rounded border px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                  <option value="">Todos</option>
                  {vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente}</option>)}
               </select>
            </div>
            <div className="flex items-end">
                <button onClick={resetFilters} className={`w-full px-3 py-2 text-sm rounded border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}>
                    Limpiar Filtros
                </button>
            </div>
          </div>
        )}
      </div>

      <div className={`rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden mb-6 shadow-md`}>
        {loading ? (
          <p className="p-8 text-center text-gray-500">Cargando movimientos...</p>
        ) : error ? (
          <p className="p-8 text-center text-red-500">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
                <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'}>
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Comp.</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {currentItems.length > 0 ? currentItems.map((mov) => (
                    <tr key={`${mov.tipo_movimiento}-${mov.id}`} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {new Date(mov.fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mov.tipo_movimiento === 'INGRESO' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                            {mov.tipo_movimiento}
                        </span>
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="font-medium">{mov.nombre || mov.descripcion}</div>
                        </td>
                        <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {mov.categoria}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                        mov.tipo_movimiento === 'INGRESO' ? 'text-green-500' : 'text-red-500'
                        }`}>
                        $ {mov.monto.toLocaleString('es-AR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                        {mov.imagen_url ? (
                            <a href={mov.imagen_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors">
                            <FaFileInvoice size={16} />
                            </a>
                        ) : <span className="text-gray-300 text-xs">-</span>}
                        </td>
                    </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                No se encontraron movimientos con los filtros aplicados.
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
            
            <Pagination 
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onPageChange={setPaginaActual}
                darkMode={darkMode}
                totalItems={totalItems}
                currentItems={currentItems}
            />
          </>
        )}
      </div>

      {/* Modales */}
      <GastoFormModal 
        isOpen={modalGastoOpen} 
        onClose={(refresh) => {
          setModalGastoOpen(false);
          if (refresh) fetchData();
        }} 
      />
      <IngresoFormModal 
        isOpen={modalIngresoOpen} 
        onClose={(refresh) => {
          setModalIngresoOpen(false);
          if (refresh) fetchData();
        }} 
      />
    </div>
  );
}