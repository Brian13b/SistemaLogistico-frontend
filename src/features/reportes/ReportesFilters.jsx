import { Calendar, Download } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import { periodosFiltro } from "../../utils/reportData"
import { useState } from "react"

export function ReportesFilters({ datos, filtros, aplicarFiltros, exportarReporte, loading }) {
  const { darkMode } = useTheme();
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const handleFiltroChange = (tipo, valor) => {
    const nuevosFiltros = {
      ...filtros,
      [tipo]: valor
    };
    aplicarFiltros(nuevosFiltros);
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
                }`}
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
              }`}
            >
              {datos.vehiculos && datos.vehiculos.map((vehiculo) => (
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
              }`}
            >
              {datos.conductores && datos.conductores.map((conductor) => (
                <option key={conductor.value} value={conductor.value}>
                  {conductor.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowExportConfirm(true)}
              disabled={loading}
              className={`h-9 px-3 py-1 text-sm rounded border flex items-center gap-2 transition-colors ${
                darkMode 
                  ? 'border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {showExportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h3 className="text-lg font-semibold mb-4">Confirmar Exportación</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              ¿Estás seguro de que quieres exportar los datos actuales a CSV?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExportConfirm(false)}
                className={`h-9 px-4 py-2 rounded border ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                    exportarReporte('csv');
                    setShowExportConfirm(false);
                }}
                className="h-9 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
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