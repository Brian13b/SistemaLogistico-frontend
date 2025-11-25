import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { finanzasService } from '../services/finanzasService';
import GastoFormModal from '../features/finanzas/GastoFormModal'; 
import IngresoFormModal from '../features/finanzas/IngresoFormModal';
import { FaPlus, FaMinus, FaFileInvoice } from 'react-icons/fa';

export default function Finanzas() {
  const { darkMode } = useTheme();
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [modalIngresoOpen, setModalIngresoOpen] = useState(false);

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const [gastosRes, ingresosRes] = await Promise.all([
        finanzasService.obtenerGastos(),
        finanzasService.obtenerIngresos()
      ]);

      const listaGastos = (gastosRes.data || []).map(g => ({ ...g, tipo_movimiento: 'EGRESO', categoria: g.tipo_gasto }));
      const listaIngresos = (ingresosRes.data || []).map(i => ({ ...i, tipo_movimiento: 'INGRESO', categoria: i.tipo_ingreso }));

      const todos = [...listaGastos, ...listaIngresos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      setMovimientos(todos);
    } catch (error) {
      console.error("Error cargando finanzas", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Caja y Finanzas
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setModalGastoOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2 hover:bg-red-700"
          >
            <FaMinus /> Nuevo Gasto
          </button>
          <button 
            onClick={() => setModalIngresoOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700"
          >
            <FaPlus /> Nuevo Ingreso
          </button>
        </div>
      </div>

      {/* TABLA DE MOVIMIENTOS */}
      <div className={`rounded-lg overflow-hidden shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
            {movimientos.map((mov) => (
              <tr key={`${mov.tipo_movimiento}-${mov.id}`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {new Date(mov.fecha).toLocaleDateString('es-AR')}
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
                  {mov.nombre || mov.descripcion}
                </td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {mov.categoria}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                   mov.tipo_movimiento === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                }`}>
                  $ {mov.monto.toLocaleString('es-AR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {mov.imagen_url && (
                    <a href={mov.imagen_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700">
                      <FaFileInvoice size={18} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALES */}
      <GastoFormModal 
        isOpen={modalGastoOpen} 
        onClose={(refresh) => {
          setModalGastoOpen(false);
          if (refresh) cargarMovimientos();
        }} 
      />
      <IngresoFormModal 
        isOpen={modalIngresoOpen} 
        onClose={(refresh) => {
          setModalIngresoOpen(false);
          if (refresh) cargarMovimientos();
        }} 
      />
    </div>
  );
}