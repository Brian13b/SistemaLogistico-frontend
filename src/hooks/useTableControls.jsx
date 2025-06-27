import { useState, useMemo } from 'react';

export const useTableControls = (initialFilters = {}, initialItemsPerPage = 5) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(initialItemsPerPage);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const resetFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
    setPaginaActual(1);
  };

  const applyFilters = (data) => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        Object.values(item).some(
          value => typeof value === 'string' && 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesFilters = Object.entries(filters).every(([key, value]) => 
        value === '' || 
        (item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase()))
      );
      
      return matchesSearch && matchesFilters;
    });
  };

  const filteredData = (data) => useMemo(() => applyFilters(data), [data, searchTerm, filters]);

  const paginateData = (data) => {
    const totalPaginas = Math.ceil(data.length / itemsPorPagina);
    
    // Ajustar página actual si es necesario
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
    
    const indexUltimoItem = paginaActual * itemsPorPagina;
    const indexPrimerItem = indexUltimoItem - itemsPorPagina;
    return {
      paginatedData: data.slice(indexPrimerItem, indexUltimoItem),
      totalPaginas,
      totalItems: data.length
    };
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    paginaActual,
    setPaginaActual,
    itemsPorPagina,
    showAdvancedFilters,
    setShowAdvancedFilters,
    resetFilters,
    filteredData,
    paginateData
  };
};