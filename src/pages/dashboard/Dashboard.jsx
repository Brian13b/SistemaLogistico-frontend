import React, { use, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setLastUpdated } from '../../store/appSlice.js';
import { fetchVehiculos } from '../../store/vehiculosSlice.js';
import { fetchConductores } from '../../store/conductoresSlice.js';
import { fetchViajes } from '../../store/viajesSlice.js';
import { fetchVencimientos } from '../../store/vencimientosSlice.js';
import { selectRecentActivities } from '../../store/activitiesSlice.js';
import DashboardCard from '../../components/DashboardCard';
import DataTable from '../../components/common/DataTable';
import ActivitiesModal from '../../components/ActivitiesModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import { FaTruck, FaUser, FaRoute, FaCheckCircle, FaExclamationTriangle, FaTools, FaGasPump } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

export default function Dashboard({ userRole }) {
  const { darkMode } = useTheme();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.app.loading);
  
  // Selectores
  const vehiculos = useSelector((state) => state.vehiculos.items);
  const conductores = useSelector((state) => state.conductores.items);
  const viajes = useSelector((state) => state.viajes.items);
  const vencimientos = useSelector((state) => state.vencimientos.items);
  
  const vehiculosStatus = useSelector((state) => state.vehiculos.status);
  const conductoresStatus = useSelector((state) => state.conductores.status);
  const viajesStatus = useSelector((state) => state.viajes.status);
  const vencimientosStatus = useSelector((state) => state.vencimientos.status);
  
  const vehiculosError = useSelector((state) => state.vehiculos.error);
  const conductoresError = useSelector((state) => state.conductores.error);
  const viajesError = useSelector((state) => state.viajes.error);
  const vencimientosError = useSelector((state) => state.vencimientos.error);
  
  const actividadReciente = useSelector(selectRecentActivities);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);

  const confirmDialog = useConfirmDialog();

  const getActivityIcon = (type) => {
    const iconMap = {
      vehiculo_creado: FaTruck,
      vehiculo_actualizado: FaTruck,
      vehiculo_eliminado: FaTruck,
      conductor_creado: FaUser,
      conductor_actualizado: FaUser,
      conductor_eliminado: FaUser,
      viaje_creado: FaRoute,
      viaje_actualizado: FaRoute,
      viaje_eliminado: FaRoute,
      viaje_iniciado: FaRoute,
      viaje_completado: FaCheckCircle,
      documento_subido: FaExclamationTriangle,
      documento_eliminado: FaExclamationTriangle
    };
    return iconMap[type] || FaCheckCircle;
  };

  const getActivityColor = (type) => {
    if (type.includes('creado')) return 'green';
    if (type.includes('actualizado')) return 'blue';
    if (type.includes('eliminado')) return 'red';
    if (type.includes('iniciado')) return 'yellow';
    if (type.includes('completado')) return 'green';
    return 'gray';
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return activityDate.toLocaleDateString('es-AR');
  };

  useEffect(() => {
    dispatch(setLoading(true));
    Promise.all([
      dispatch(fetchVehiculos()),
      dispatch(fetchConductores()),
      dispatch(fetchViajes()),
      dispatch(fetchVencimientos()),
    ]).finally(() => {
      dispatch(setLoading(false));
      dispatch(setLastUpdated());
    });
    
  }, [dispatch]);

  const getEntidadInfo = (doc) => {
    if (doc.tipo_entidad === 'VEHICULO') {
      const vehiculo = vehiculos.find(v => v.id === doc.entidad_id);
      return vehiculo ? `🚛 ${vehiculo.patente}` : 'Vehículo';
    }
    if (doc.tipo_entidad === 'CONDUCTOR') {
      const conductor = conductores.find(c => c.id === doc.entidad_id);
      return conductor ? `👤 ${conductor.nombre} ${conductor.apellido}` : 'Conductor';
    }
    if (doc.tipo_entidad === 'VIAJE') {
      const viaje = viajes.find(v => v.id === doc.entidad_id);
      const codigo = viaje?.codigo || `VJ-${String(doc.entidad_id).padStart(4,'0')}`;
      return viaje ? `📦 ${codigo}` : 'Viaje';
    }
    return 'Documento';
  };

  const proximosVencimientos = useMemo(() => {
    if (!vencimientos) return [];
    
    return [...vencimientos]
      .filter(doc => doc.fecha || doc.fecha_vencimiento)
      .sort((a, b) => {
        const dateA = new Date(a.fecha || a.fecha_vencimiento);
        const dateB = new Date(b.fecha || b.fecha_vencimiento);
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [vencimientos]);

  const handleRetry = () => {
    confirmDialog.showDialog({
      title: 'Recargar datos',
      message: '¿Estás seguro de que quieres recargar todos los datos del dashboard?',
      type: 'info',
      confirmText: 'Recargar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        dispatch(setLoading(true));
        try {
          await Promise.all([
            dispatch(fetchVehiculos()),
            dispatch(fetchConductores()),
            dispatch(fetchViajes()),
            dispatch(fetchVencimientos()),
          ]);
        } finally {
          dispatch(setLoading(false));
          dispatch(setLastUpdated());
        }
      }
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-AR', { timeZone: 'UTC' });
  };

  const getActividadIcon = (actividad) => {
    const Icon = getActivityIcon(actividad.type);
    const color = getActivityColor(actividad.type);
    const colorClasses = {
      green: darkMode ? 'text-green-400' : 'text-green-600',
      blue: darkMode ? 'text-blue-400' : 'text-blue-600',
      yellow: darkMode ? 'text-yellow-400' : 'text-yellow-600',
      red: darkMode ? 'text-red-400' : 'text-red-600',
      gray: darkMode ? 'text-gray-400' : 'text-gray-600'
    };
    
    return <Icon className={`h-5 w-5 ${colorClasses[color]}`} />;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
          Resumen general del sistema de gestión de flotas
        </p>
        {loading && (
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Cargando datos...
          </p>
        )}
        
        {/* Mostrar errores si existen */}
        {(vehiculosError || conductoresError || viajesError || vencimientosError) && (
          <div className={`mt-4 p-4 rounded-lg border-l-4 ${
            darkMode ? 'bg-red-900 border-red-500' : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                  Error al cargar datos
                </h3>
                <div className="mt-2 space-y-1">
                  {vehiculosError && (
                    <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      • Vehículos: {vehiculosError}
                    </p>
                  )}
                  {conductoresError && (
                    <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      • Conductores: {conductoresError}
                    </p>
                  )}
                  {viajesError && (
                    <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      • Viajes: {viajesError}
                    </p>
                  )}
                  {vencimientosError && (
                    <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                      • Vencimientos: {vencimientosError}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleRetry}
                className={`px-4 py-2 text-sm rounded-lg ${
                  darkMode 
                    ? 'bg-red-700 hover:bg-red-600 text-red-100' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Resumen y Notificaciones */}
        <div className="lg:col-span-1 space-y-6">
          {/* Actividad Reciente */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Actividad Reciente
            </h2>
            
            <div className="space-y-4">
              {actividadReciente.length === 0 ? (
                <div className={`text-center py-8 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <p>No hay actividades recientes</p>
                </div>
              ) : (
                actividadReciente.map((actividad) => {
                  const color = getActivityColor(actividad.type);
                  return (
                    <div 
                      key={actividad.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        color === 'green'
                          ? darkMode 
                            ? 'bg-green-900 border-green-500' 
                            : 'bg-green-50 border-green-500'
                          : color === 'blue'
                            ? darkMode 
                              ? 'bg-blue-900 border-blue-500' 
                              : 'bg-blue-50 border-blue-500'
                            : color === 'yellow'
                              ? darkMode 
                                ? 'bg-yellow-900 border-yellow-500' 
                                : 'bg-yellow-50 border-yellow-500'
                              : color === 'red'
                                ? darkMode 
                                  ? 'bg-red-900 border-red-500' 
                                  : 'bg-red-50 border-red-500'
                                : darkMode 
                                  ? 'bg-gray-700 border-gray-500' 
                                  : 'bg-gray-50 border-gray-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActividadIcon(actividad)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={`font-medium text-sm ${
                                color === 'green'
                                  ? darkMode ? 'text-green-200' : 'text-green-800'
                                  : color === 'blue'
                                    ? darkMode ? 'text-blue-200' : 'text-blue-800'
                                    : color === 'yellow'
                                      ? darkMode ? 'text-yellow-200' : 'text-yellow-800'
                                      : color === 'red'
                                        ? darkMode ? 'text-red-200' : 'text-red-800'
                                        : darkMode ? 'text-gray-200' : 'text-gray-800'
                              }`}>
                                {actividad.title}
                              </p>
                              <p className={`text-xs mt-1 ${
                                color === 'green'
                                  ? darkMode ? 'text-green-300' : 'text-green-600'
                                  : color === 'blue'
                                    ? darkMode ? 'text-blue-300' : 'text-blue-600'
                                    : color === 'yellow'
                                      ? darkMode ? 'text-yellow-300' : 'text-yellow-600'
                                      : color === 'red'
                                        ? darkMode ? 'text-red-300' : 'text-red-600'
                                        : darkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {actividad.description}
                              </p>
                            </div>
                            <span className={`text-xs font-medium ${
                              color === 'green'
                                ? darkMode ? 'text-green-200' : 'text-green-800'
                                : color === 'blue'
                                  ? darkMode ? 'text-blue-200' : 'text-blue-800'
                                  : color === 'yellow'
                                    ? darkMode ? 'text-yellow-200' : 'text-yellow-800'
                                    : color === 'red'
                                      ? darkMode ? 'text-red-200' : 'text-red-800'
                                      : darkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {getRelativeTime(actividad.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <button 
              onClick={() => setShowActivitiesModal(true)}
              className={`mt-4 w-full text-sm py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Ver toda la actividad
            </button>
          </div>
  
          
        </div>
  
        {/* Columna derecha - Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjetas de Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DashboardCard 
              title="Vehículos" 
              value={vehiculosStatus === 'loading' ? '...' : vehiculos.length}
              darkMode={darkMode}
              icon={<FaTruck className="text-3xl" />}
              trend={vehiculos}
            />
            <DashboardCard 
              title="Conductores" 
              value={conductoresStatus === 'loading' ? '...' : conductores.length} 
              darkMode={darkMode}
              icon={<FaUser className="text-3xl" />}
              trend={conductores}
            />
          </div>

          {/* Tabla de Viajes Activos */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Viajes Activos
                {viajesStatus === 'loading' && (
                  <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    (Cargando...)
                  </span>
                )}
              </h2>
            </div>
            
            {viajesError ? (
              <div className={`p-4 rounded-lg border-l-4 ${
                darkMode ? 'bg-red-900 border-red-500' : 'bg-red-50 border-red-500'
              }`}>
                <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                  Error al cargar viajes: {viajesError}
                </p>
                <button
                  onClick={() => dispatch(fetchViajes())}
                  className={`mt-2 px-3 py-1 text-xs rounded ${
                    darkMode 
                      ? 'bg-red-700 hover:bg-red-600 text-red-100' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <DataTable 
                darkMode={darkMode}
                columns={[
                  { header: 'Código', accessor: 'codigo' },
                  { header: 'Origen', accessor: 'origen' },
                  { header: 'Destino', accessor: 'destino' },
                  { header: 'Fecha Salida', accessor: 'fecha_salida' },
                  { header: 'Estado', accessor: 'estado', 
                    cell: (value) => (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        value === 'PROGRAMADO' 
                          ? darkMode 
                            ? 'bg-blue-900 text-blue-200' 
                            : 'bg-blue-100 text-blue-800'
                          : value === 'EN PROGRESO'
                            ? darkMode
                              ? 'bg-yellow-900 text-yellow-200'
                              : 'bg-yellow-100 text-yellow-800'
                            : darkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                      }`}>
                        {value}
                      </span>
                    )
                  }
                ]}
                data={
                  viajes
                    .filter(viaje => ['PROGRAMADO', 'EN PROGRESO'].includes(viaje.estado.toUpperCase()))
                    .slice(0, 5)
                    .map(v => ({
                      ...v,
                      fecha_salida: formatDate(v.fecha_salida)
                    }))
                }
              />
            )}
          </div>

          {/* Panel de Vencimientos */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Vencimientos Próximos
              {vencimientosStatus === 'loading' && (
                <span className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  (Cargando...)
                </span>
              )}
            </h2>
            
            {vencimientosError ? (
              <div className={`p-4 rounded-lg border-l-4 ${darkMode ? 'bg-red-900 border-red-500' : 'bg-red-50 border-red-500'}`}>
                <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{vencimientosError}</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {proximosVencimientos.length === 0 ? (
                     <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No hay vencimientos próximos.</p>
                  ) : (
                    proximosVencimientos.map((vencimiento, index) => {
                      const fechaReal = vencimiento.fecha || vencimiento.fecha_vencimiento;

                      const daysLeft = Math.ceil((new Date(fechaReal) - new Date()) / (1000 * 60 * 60 * 24));
                      const isExpired = daysLeft < 0;
                      const isUrgent = daysLeft < 15;
                      
                      const borderColor = isExpired ? 'border-red-500' : isUrgent ? 'border-yellow-500' : 'border-green-500';
                      const bgColor = isExpired 
                        ? (darkMode ? 'bg-red-900/20' : 'bg-red-50') 
                        : isUrgent 
                          ? (darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50')
                          : (darkMode ? 'bg-green-900/20' : 'bg-green-50');

                      return (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${borderColor} ${bgColor}`}>
                          <div className="flex justify-between items-center">
                            
                            {/* Lado Izquierdo */}
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {vencimiento.tipo_documento || vencimiento.tipo}
                              </p>
                              
                              <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {vencimiento.entidad_id ? getEntidadInfo(vencimiento) : (vencimiento.descripcion || 'Vencimiento')}
                              </p>
                            </div>

                            {/* Lado Derecho */}
                            <div className="text-right">
                              <p className={`text-sm font-bold ${isExpired ? 'text-red-500' : isUrgent ? 'text-yellow-500' : 'text-green-600'}`}>
                                {formatDate(fechaReal)}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isExpired ? 'Vencido' : `${daysLeft} días`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <button 
                  className={`mt-4 w-full text-sm py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Ver calendario completo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de actividades */}
      <ActivitiesModal 
        isOpen={showActivitiesModal}
        onClose={() => setShowActivitiesModal(false)}
        darkMode={darkMode}
      />
      
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
