import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

export const Pagination = ({ 
  paginaActual, 
  totalPaginas, 
  onPageChange,
  darkMode = false,
  currentItems,
  totalItems
}) => {
  const getPageNumbers = () => {
    if (totalPaginas <= 5) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }
    
    if (paginaActual <= 3) {
      return [1, 2, 3, 4, '...', totalPaginas];
    }
    
    if (paginaActual >= totalPaginas - 2) {
      return [1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
    }
    
    return [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas];
  };

  return (
    <div className={`flex justify-between items-center p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="text-md text-gray-700 dark:text-gray-300">
        Mostrando {currentItems.length } de {totalItems} elementos
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => onPageChange(1)} 
          disabled={paginaActual === 1}
          className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'} ${paginaActual === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaAngleDoubleLeft />
        </button>
        <button 
          onClick={() => onPageChange(paginaActual - 1)} 
          disabled={paginaActual === 1}
          className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'} ${paginaActual === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaAngleLeft />
        </button>
        
        {getPageNumbers().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3">...</span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`p-2 min-w-[40px] rounded ${paginaActual === pageNum ? (darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white') : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}
            >
              {pageNum}
            </button>
          )
        ))}
        
        <button 
          onClick={() => onPageChange(paginaActual + 1)} 
          disabled={paginaActual === totalPaginas}
          className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'} ${paginaActual === totalPaginas ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaAngleRight />
        </button>
        <button 
          onClick={() => onPageChange(totalPaginas)} 
          disabled={paginaActual === totalPaginas}
          className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200'} ${paginaActual === totalPaginas ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaAngleDoubleRight />
        </button>
      </div>
    </div>
  );
};