import { Calendar, Download } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import { useReportes } from "../../hooks/useReportes"
import { periodosFiltro } from "../../utils/reportData"
import { useState } from "react"

export function ReportesFilters() {
  const { darkMode } = useTheme();
  const { datos, filtros, aplicarFiltros, exportarReporte, loading } = useReportes();
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const handleFiltroChange = async (tipo, valor) => {
    const nuevosFiltros = {
      ...filtros,
      [tipo]: valor
    };
    await aplicarFiltros(nuevosFiltros);
  };

  const handleExportar = async () => {
    setShowExportConfirm(true);
  };

  const confirmarExportacion = async () => {
    setShowExportConfirm(false);
    await exportarReporte('csv');
  };

  const cancelarExportacion = () => {
    setShowExportConfirm(false);
  };

  return (
    <>
      <div className={`p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={filtros.periodo}
                onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                disabled={loading}
                className={`w-[140px] h-9 px-3 py-1 text-sm rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {periodosFiltro.map((periodo) => (
                  <option key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filtros.vehiculo}
              onChange={(e) => handleFiltroChange('vehiculo', e.target.value)}
              disabled={loading}
              className={`w-[140px] h-9 px-3 py-1 text-sm rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {datos.vehiculos.map((vehiculo) => (
                <option key={vehiculo.value} value={vehiculo.value}>
                  {vehiculo.label}
                </option>
              ))}
            </select>

            <select
              value={filtros.conductor}
              onChange={(e) => handleFiltroChange('conductor', e.target.value)}
              disabled={loading}
              className={`w-[140px] h-9 px-3 py-1 text-sm rounded border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {datos.conductores.map((conductor) => (
                <option key={conductor.value} value={conductor.value}>
                  {conductor.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportar}
              disabled={loading}
              className={`h-9 px-3 py-1 text-sm rounded border flex items-center gap-2 transition-colors ${
                darkMode 
                  ? 'border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Download className="h-4 w-4" />
              {loading ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        </div>
        
        {/* Mostrar filtros activos */}
        {(filtros.periodo !== "30days" || filtros.vehiculo !== "all-vehicles" || filtros.conductor !== "all-drivers") && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Filtros activos:
              </span>
              {filtros.periodo !== "30days" && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  {periodosFiltro.find(p => p.value === filtros.periodo)?.label}
                </span>
              )}
              {filtros.vehiculo !== "all-vehicles" && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                }`}>
                  {datos.vehiculos.find(v => v.value === filtros.vehiculo)?.label}
                </span>
              )}
              {filtros.conductor !== "all-drivers" && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {datos.conductores.find(c => c.value === filtros.conductor)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de exportación */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h3 className="text-lg font-semibold mb-4">Confirmar Exportación</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              ¿Estás seguro de que quieres exportar {datos.viajes.length} viajes a un archivo CSV?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarExportacion}
                className={`h-9 px-4 py-2 rounded border transition-colors ${
                  darkMode 
                    ? 'border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExportacion}
                className={`h-9 px-4 py-2 rounded transition-colors ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
