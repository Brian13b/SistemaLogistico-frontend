import { useTheme } from "../../context/ThemeContext"
import { useReportes } from "../../hooks/useReportes"
import { estadosMap } from "../../utils/reportData"

function formatFecha(fecha) {
  if (!fecha) return "N/A";
  const date = new Date(fecha);
  return date.toLocaleDateString("es-AR");
}

function formatCosto(costo) {
  if (!costo) return "N/A";
  return `$${Number(costo).toLocaleString("es-AR")}`;
}

export function ReportesTable() {
  const { darkMode } = useTheme();
  const { datos, loading } = useReportes();

  const getStatusBadge = (estado) => {
    const info = estadosMap[estado] || { 
      text: "Desconocido", 
      className: darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800" 
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${info.className}`}>
        {info.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Reporte de Viajes
          </h3>
        </div>
        <div className={`flex items-center justify-center py-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Cargando datos...
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Reporte de Viajes ({datos.viajes.length} viajes)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>ID</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Patente</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Conductor</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Origen</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Destino</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fecha</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Kilómetros</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Combustible (L)</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Costo</th>
              <th className={`text-left py-3 px-4 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {datos.viajes.length > 0 ? (
              datos.viajes.map((viaje) => (
                <tr 
                  key={viaje.id} 
                  className={`border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <td className={`py-3 px-4 font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {viaje.id}
                  </td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {viaje.patente}
                  </td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {viaje.conductor}
                  </td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {viaje.origen}
                  </td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {viaje.destino}
                  </td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatFecha(viaje.fecha)}
                  </td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {viaje.kilometros}
                  </td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {viaje.combustible}
                  </td>
                  <td className={`py-3 px-4 font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCosto(viaje.costo)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(viaje.estado)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={10} 
                  className={`text-center py-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  No se encontraron viajes con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}