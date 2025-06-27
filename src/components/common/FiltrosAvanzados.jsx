import { FaTimes } from 'react-icons/fa';

export const AdvancedFilters = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  onApply, 
  show, 
  onClose,
  darkMode = false,
  filterConfig = []
}) => {
  if (!show) return null;

  return (
    <div className={`absolute right-0 mt-2 w-72 z-10 rounded-md shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} p-4`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Filtros avanzados</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-600"
        >
          <FaTimes size={14} />
        </button>
      </div>
      
      <div className="space-y-3">
        {filterConfig.map(filter => (
          <div key={filter.name}>
            <label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {filter.label}
            </label>
            <input
              type={filter.type || 'text'}
              placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
              value={filters[filter.name] || ''}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
              className={`w-full px-3 py-1 text-sm rounded ${
                darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-4 pt-3">
        <button 
          onClick={onReset}
          className={`px-3 py-2 text-sm rounded ${darkMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          Limpiar filtros
        </button>
        <button 
          onClick={onApply}
          className={`px-3 py-1 text-sm rounded ${darkMode ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};