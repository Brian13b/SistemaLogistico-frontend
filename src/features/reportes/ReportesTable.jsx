import { useTheme } from "../../context/ThemeContext"
import { estadosMap } from "../../utils/reportData"

function formatFecha(fecha) {
  if (!fecha) return "N/A";
  const date = new Date(fecha);
  return date.toLocaleDateString("es-AR");
}

function formatCosto(costo) {
  if (costo === undefined || costo === null) return "-";
  return `$${Number(costo).toLocaleString("es-AR")}`;
}

export function ReportesTable({ datos, loading }) {
  const { darkMode } = useTheme();

  const getStatusBadge = (estado) => {
    const info = estadosMap[estado] || { 
      text: estado || "Desconocido", 
      className: darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800" 
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${info.className}`}>
        {info.text}
      </span>
    );
  };

  if (loading) return null;

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Últimos Viajes ({datos.viajes.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Origen</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Destino</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Fecha</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Precio</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Estado</th>
            </tr>
          </thead>
          <tbody>
            {datos.viajes.length > 0 ? (
              datos.viajes.map((viaje) => (
                <tr 
                  key={viaje.id} 
                  className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{viaje.id}</td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{viaje.origen}</td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{viaje.destino}</td>
                  <td className={`py-3 px-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{formatFecha(viaje.fecha)}</td>
                  <td className={`py-3 px-4 text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{formatCosto(viaje.costo)}</td>
                  <td className="py-3 px-4">{getStatusBadge(viaje.estado)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No hay viajes recientes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}