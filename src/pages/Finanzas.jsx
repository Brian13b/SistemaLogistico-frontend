import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { finanzasService } from '../services/finanzasService';
import { vehiculosService } from '../services/VehiculosService';
import { conductoresService } from '../services/ConductoresService';
import { viajesService } from '../services/ViajesService';
import GastoFormModal from '../features/finanzas/GastoFormModal';
import IngresoFormModal from '../features/finanzas/IngresoFormModal';
import { FaPlus, FaMinus, FaFileInvoice, FaFilter, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Finanzas() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [movimientos, setMovimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [viajes, setViajes] = useState([]);

  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    vehiculo: '',
    conductor: '',
    viaje: '',
    busqueda: '' 
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [modalIngresoOpen, setModalIngresoOpen] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [gastosRes, ingresosRes] = await Promise.all([
        finanzasService.obtenerGastos(),
        finanzasService.obtenerIngresos()
      ]);

      const [vehiRes, condRes, viajRes] = await Promise.all([
        vehiculosService.getAll(),
        conductoresService.getAll(),
        viajesService.getAll()
      ]);

      setVehiculos(vehiRes.data || []);
      setConductores(condRes.data || []);
      setViajes(viajRes.data || []);

      const listaGastos = (gastosRes.data || []).map(g => ({
        ...g,
        tipo_movimiento: 'EGRESO',
        categoria: g.tipo_gasto,
        vehiculo_id: g.vehiculo_id?.toString() || '',
        conductor_id: g.conductor_id?.toString() || '',
        viaje_id: g.viaje_id?.toString() || ''
      }));

      const listaIngresos = (ingresosRes.data || []).map(i => ({
        ...i,
        tipo_movimiento: 'INGRESO',
        categoria: i.tipo_ingreso,
        viaje_id: i.viaje_id?.toString() || '',
        vehiculo_id: '', 
        conductor_id: ''
      }));

      const todos = [...listaGastos, ...listaIngresos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMovimientos(todos);

    } catch (error) {
      console.error("Error cargando finanzas", error);
    } finally {
      setLoading(false);
    }
  };

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter(mov => {
      if (filtros.busqueda) {
        const termino = filtros.busqueda.toLowerCase();
        const descripcion = (mov.nombre || mov.descripcion || '').toLowerCase();
        if (!descripcion.includes(termino)) return false;
      }

      if (filtros.fechaDesde && new Date(mov.fecha) < new Date(filtros.fechaDesde)) return false;
      if (filtros.fechaHasta && new Date(mov.fecha) > new Date(filtros.fechaHasta)) return false;

      if (filtros.vehiculo && mov.vehiculo_id !== filtros.vehiculo) return false;
      if (filtros.conductor && mov.conductor_id !== filtros.conductor) return false;
      if (filtros.viaje && mov.viaje_id !== filtros.viaje) return false;

      return true;
    });
  }, [movimientos, filtros]);

  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const itemsActuales = movimientosFiltrados.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(movimientosFiltrados.length / itemsPorPagina);

  const cambiarPagina = (numero) => setPaginaActual(numero);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
    setPaginaActual(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Caja y Finanzas
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Gestiona ingresos y egresos de la flota
            </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setModalGastoOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2 hover:bg-red-700 shadow-sm"
          >
            <FaMinus className="text-xs" /> Nuevo Gasto
          </button>
          <button 
            onClick={() => setModalIngresoOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700 shadow-sm"
          >
            <FaPlus className="text-xs" /> Nuevo Ingreso
          </button>
        </div>
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className={`p-4 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-500 uppercase">
            <FaFilter /> Filtros
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Buscador */}
            <div className="lg:col-span-2 relative">
                <input
                    type="text"
                    name="busqueda"
                    placeholder="Buscar por descripción..."
                    value={filtros.busqueda}
                    onChange={handleFiltroChange}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
            </div>

            {/* Fechas */}
            <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} className={`text-sm rounded border px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />
            <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleFiltroChange} className={`text-sm rounded border px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`} />

            {/* Selects */}
            <select name="vehiculo" value={filtros.vehiculo} onChange={handleFiltroChange} className={`text-sm rounded border px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                <option value="">Todos los Vehículos</option>
                {vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>)}
            </select>

            <select name="conductor" value={filtros.conductor} onChange={handleFiltroChange} className={`text-sm rounded border px-3 py-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'}`}>
                <option value="">Todos los Conductores</option>
                {conductores.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
        </div>
      </div>

      {/* --- TABLA DE MOVIMIENTOS --- */}
      <div className={`rounded-lg overflow-hidden shadow border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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
                {itemsActuales.length > 0 ? itemsActuales.map((mov) => (
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
                    {mov.viaje_id && <div className="text-xs opacity-60">Viaje #{mov.viaje_id}</div>}
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
                        <a href={mov.imagen_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors" title="Ver Comprobante">
                        <FaFileInvoice size={16} />
                        </a>
                    ) : <span className="text-gray-300 text-xs">-</span>}
                    </td>
                </tr>
                )) : (
                    <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No se encontraron movimientos con estos filtros.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
        
        {/* --- PAGINADOR --- */}
        <div className={`px-6 py-3 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{indicePrimerItem + 1}</span> a <span className="font-medium">{Math.min(indiceUltimoItem, movimientosFiltrados.length)}</span> de <span className="font-medium">{movimientosFiltrados.length}</span> resultados
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 disabled:text-gray-600' : 'hover:bg-gray-100 disabled:text-gray-300'}`}
                >
                    <FaChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPaginas }).map((_, idx) => (
                     <button
                        key={idx}
                        onClick={() => cambiarPagina(idx + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                            paginaActual === idx + 1
                                ? 'bg-blue-600 text-white'
                                : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                     >
                        {idx + 1}
                     </button>
                ))}
                <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700 disabled:text-gray-600' : 'hover:bg-gray-100 disabled:text-gray-300'}`}
                >
                    <FaChevronRight size={14} />
                </button>
            </div>
        </div>
      </div>

      {/* Modales de Carga */}
      <GastoFormModal 
        isOpen={modalGastoOpen} 
        onClose={(refresh) => {
          setModalGastoOpen(false);
          if (refresh) cargarDatos();
        }} 
      />
      <IngresoFormModal 
        isOpen={modalIngresoOpen} 
        onClose={(refresh) => {
          setModalIngresoOpen(false);
          if (refresh) cargarDatos();
        }} 
      />
    </div>
  );
}