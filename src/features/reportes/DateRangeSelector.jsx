import { FaCalendarAlt } from 'react-icons/fa';

export const DateRangeSelector = ({
  fechaInicio,
  fechaFin,
  onStartDateChange,
  onEndDateChange,
  formatoSalida,
  onFormatChange,
  error,
  darkMode
}) => {
  const formatearFechaAR = (fechaISO) => {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR');
  };

  return (
    <div className={`p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <FaCalendarAlt className="mr-2" />
        Período
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <div className="relative">
            <input 
              type="date" 
              value={fechaInicio}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={`w-full p-2 pl-8 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'}`}
            />
            <FaCalendarAlt className={`absolute left-2 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          {fechaInicio && (
            <p className="text-sm mt-1 text-gray-500">
              Seleccionado: {formatearFechaAR(fechaInicio)}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <div className="relative">
            <input 
              type="date"
              value={fechaFin}
              onChange={(e) => onEndDateChange(e.target.value)}
              className={`w-full p-2 pl-8 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'}`}
            />
            <FaCalendarAlt className={`absolute left-2 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          {fechaFin && (
            <p className="text-sm mt-1 text-gray-500">
              Seleccionado: {formatearFechaAR(fechaFin)}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Formato de salida</label>
          <select
            value={formatoSalida}
            onChange={(e) => onFormatChange(e.target.value)}
            className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'}`}
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="web">Vista Web</option>
          </select>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
      </div>
    </div>
  );
};