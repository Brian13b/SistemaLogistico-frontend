import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectFilteredActivities, 
  setFilters, 
  clearActivities 
} from '../store/activitiesSlice.js';
import { FaTimes, FaSearch, FaFilter, FaTrash, FaCalendar } from 'react-icons/fa';
import ConfirmDialog from './common/ConfirmDialog';
import useConfirmDialog from '../hooks/useConfirmDialog';

export default function ActivitiesModal({ isOpen, onClose, darkMode }) {
  const dispatch = useDispatch();
  const activities = useSelector(selectFilteredActivities);
  const [localFilters, setLocalFilters] = useState({
    type: 'all',
    search: '',
    dateRange: null
  });
  
  const confirmDialog = useConfirmDialog();

  // Aplicar filtros cuando cambien
  useEffect(() => {
    dispatch(setFilters(localFilters));
  }, [localFilters, dispatch]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setLocalFilters({ type: 'all', search: '', dateRange: null });
  };

  const handleClearActivities = () => {
    confirmDialog.showDialog({
      title: 'Eliminar todas las actividades',
      message: '¿Estás seguro de que quieres eliminar todas las actividades? Esta acción no se puede deshacer.',
      type: 'danger',
      confirmText: 'Eliminar todo',
      cancelText: 'Cancelar',
      onConfirm: () => {
        dispatch(clearActivities());
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      vehiculo_creado: '🚗',
      vehiculo_actualizado: '✏️',
      vehiculo_eliminado: '🗑️',
      conductor_creado: '👤',
      conductor_actualizado: '✏️',
      conductor_eliminado: '🗑️',
      viaje_creado: '🗺️',
      viaje_actualizado: '✏️',
      viaje_eliminado: '🗑️',
      viaje_iniciado: '▶️',
      viaje_completado: '✅',
      documento_subido: '📄',
      documento_eliminado: '🗑️'
    };
    return iconMap[type] || '📝';
  };

  const getActivityColor = (type) => {
    if (type.includes('creado')) return 'green';
    if (type.includes('actualizado')) return 'blue';
    if (type.includes('eliminado')) return 'red';
    if (type.includes('iniciado')) return 'yellow';
    if (type.includes('completado')) return 'green';
    return 'gray';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Actividades del Sistema
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <FaTimes className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tipo de Actividad
              </label>
              <select
                value={localFilters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">Todos</option>
                <option value="vehiculo">Vehículos</option>
                <option value="conductor">Conductores</option>
                <option value="viaje">Viajes</option>
                <option value="documento">Documentos</option>
              </select>
            </div>

            {/* Búsqueda */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Buscar
              </label>
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Buscar actividades..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-end space-x-2">
              <button
                onClick={handleClearFilters}
                className={`px-4 py-2 rounded-lg text-sm ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Limpiar Filtros
              </button>
              <button
                onClick={handleClearActivities}
                className={`px-4 py-2 rounded-lg text-sm ${
                  darkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de actividades */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className={`text-center py-8 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <FaCalendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay actividades para mostrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const color = getActivityColor(activity.type);
                return (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      color === 'green'
                        ? darkMode 
                          ? 'bg-green-900 border-green-500' 
                          : 'bg-green-50 border-green-500'
                        : color === 'blue'
                          ? darkMode 
                            ? 'bg-blue-900 border-blue-500' 
                            : 'bg-blue-50 border-blue-500'
                          : color === 'red'
                            ? darkMode 
                              ? 'bg-red-900 border-red-500' 
                              : 'bg-red-50 border-red-500'
                            : color === 'yellow'
                              ? darkMode 
                                ? 'bg-yellow-900 border-yellow-500' 
                                : 'bg-yellow-50 border-yellow-500'
                              : darkMode 
                                ? 'bg-gray-700 border-gray-500' 
                                : 'bg-gray-50 border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`font-medium ${
                              color === 'green'
                                ? darkMode ? 'text-green-200' : 'text-green-800'
                                : color === 'blue'
                                  ? darkMode ? 'text-blue-200' : 'text-blue-800'
                                  : color === 'red'
                                    ? darkMode ? 'text-red-200' : 'text-red-800'
                                    : color === 'yellow'
                                      ? darkMode ? 'text-yellow-200' : 'text-yellow-800'
                                      : darkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {activity.title}
                            </h3>
                            <p className={`text-sm mt-1 ${
                              color === 'green'
                                ? darkMode ? 'text-green-300' : 'text-green-600'
                                : color === 'blue'
                                  ? darkMode ? 'text-blue-300' : 'text-blue-600'
                                  : color === 'red'
                                    ? darkMode ? 'text-red-300' : 'text-red-600'
                                    : color === 'yellow'
                                      ? darkMode ? 'text-yellow-300' : 'text-yellow-600'
                                      : darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {activity.description}
                            </p>
                          </div>
                          <span className={`text-xs font-medium ${
                            color === 'green'
                              ? darkMode ? 'text-green-200' : 'text-green-800'
                              : color === 'blue'
                                ? darkMode ? 'text-blue-200' : 'text-blue-800'
                                : color === 'red'
                                  ? darkMode ? 'text-red-200' : 'text-red-800'
                                  : color === 'yellow'
                                    ? darkMode ? 'text-yellow-200' : 'text-yellow-800'
                                    : darkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Mostrando {activities.length} actividades
            </p>
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.dialog.isOpen}
        title={confirmDialog.dialog.title}
        message={confirmDialog.dialog.message}
        type={confirmDialog.dialog.type}
        confirmText={confirmDialog.dialog.confirmText}
        cancelText={confirmDialog.dialog.cancelText}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
        darkMode={darkMode}
        isLoading={confirmDialog.dialog.isLoading}
      />
    </div>
  );
}
