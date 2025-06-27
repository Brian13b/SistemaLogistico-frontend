import { FaRoad, FaTruck, FaUser, FaFileInvoice } from 'react-icons/fa';

const iconComponents = {
  viajes: FaRoad,
  vehiculos: FaTruck,
  conductores: FaUser,
  facturacion: FaFileInvoice
};

export const ReportTypeSelector = ({
  tiposReportes,
  reportesSeleccionados,
  onSelect,
  darkMode
}) => {
  const manejarSeleccionReporte = (id) => {
    onSelect({
      ...reportesSeleccionados,
      [id]: !reportesSeleccionados[id]
    });
  };

  return (
    <div className={`p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-lg font-semibold mb-4">Tipos de Reportes</h2>
      <div className="space-y-3">
        {tiposReportes.map((tipo) => {
          const Icon = iconComponents[tipo.id];
          return (
            <label key={tipo.id} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={reportesSeleccionados[tipo.id]}
                onChange={() => manejarSeleccionReporte(tipo.id)}
                className="hidden"
              />
              <span className={`w-5 h-5 inline-block rounded border transition-colors ${
                reportesSeleccionados[tipo.id] 
                  ? `bg-${tipo.color}-500 border-${tipo.color}-600` 
                  : `${darkMode ? 'border-gray-600 group-hover:border-gray-400' : 'border-gray-300 group-hover:border-gray-500'}`
              } flex items-center justify-center`}>
                {reportesSeleccionados[tipo.id] && (
                  <span className="text-white text-xl">✔</span>
                )}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`w-6 h-6 rounded-full bg-${tipo.color}-${darkMode ? '500' : '600'} flex items-center justify-center text-white`}>
                  <Icon className="w-3 h-3" />
                </span>
                <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tipo.nombre}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};