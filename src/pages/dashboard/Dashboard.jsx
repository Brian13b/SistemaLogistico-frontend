import React, { use, useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard';
import DataTable from '../../components/common/DataTable';
import { vehiculosService } from '../../services/VehiculosService';
import { conductoresService } from '../../services/ConductoresService';
import { vehiculoDocumentosService } from '../../services/VehiculoDocumentosServices';
import { conductorDocumentosService } from '../../services/ConductorDocumentosServices';
import { viajesDocumentosService } from '../../services/ViajesDocumentosService';
import { viajesService } from '../../services/ViajesService';
import { FaTruck, FaUser, FaRoute, FaCheckCircle, FaExclamationTriangle, FaTools, FaGasPump } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

export default function Dashboard({ userRole }) {
  const { darkMode } = useTheme();

  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);

  // Generar actividad reciente simulada
  const generarActividadReciente = () => {
    const actividades = [
      {
        id: 1,
        tipo: 'viaje_completado',
        titulo: 'Viaje Completado',
        descripcion: 'Viaje #V-2024-001 de Buenos Aires a Córdoba completado exitosamente',
        tiempo: 'Hace 2 horas',
        icono: FaCheckCircle,
        color: 'green',
        vehiculo: 'ABC-123',
        conductor: 'Juan Pérez'
      },
      {
        id: 2,
        tipo: 'gasto_combustible',
        titulo: 'Gasto de Combustible',
        descripcion: 'Se registró gasto de $45,000 en combustible para vehículo DEF-456',
        tiempo: 'Hace 4 horas',
        icono: FaGasPump,
        color: 'blue',
        vehiculo: 'DEF-456',
        monto: '$45,000'
      },
      {
        id: 3,
        tipo: 'mantenimiento_programado',
        titulo: 'Mantenimiento Programado',
        descripcion: 'Mantenimiento preventivo programado para vehículo GHI-789',
        tiempo: 'Hace 6 horas',
        icono: FaTools,
        color: 'yellow',
        vehiculo: 'GHI-789',
        fecha: '15/12/2024'
      },
      {
        id: 4,
        tipo: 'documento_vencimiento',
        titulo: 'Documento por Vencer',
        descripcion: 'VTV del vehículo JKL-012 vence en 5 días',
        tiempo: 'Hace 8 horas',
        icono: FaExclamationTriangle,
        color: 'red',
        vehiculo: 'JKL-012',
        dias: 5
      },
      {
        id: 5,
        tipo: 'nuevo_viaje',
        titulo: 'Nuevo Viaje Creado',
        descripcion: 'Viaje #V-2024-002 de Rosario a Mendoza programado',
        tiempo: 'Hace 12 horas',
        icono: FaRoute,
        color: 'purple',
        origen: 'Rosario',
        destino: 'Mendoza'
      },
      {
        id: 6,
        tipo: 'conductor_registrado',
        titulo: 'Conductor Registrado',
        descripcion: 'Nuevo conductor Carlos Rodríguez agregado al sistema',
        tiempo: 'Hace 1 día',
        icono: FaUser,
        color: 'indigo',
        conductor: 'Carlos Rodríguez'
      }
    ];

    return actividades;
  };

  // Generar proximos vencimientos simulados
  const generarProximosVencimientos = () => {
    const hoy = new Date();
    const proximosVencimientos = [
      {
        id: 1,
        tipo: 'vehiculo',
        descripcion: 'VTV del vehículo ABC-123 vence en 5 días',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 5),
        critico: false,
        warning: true
      },
      {
        id: 2,
        tipo: 'conductor',
        descripcion: 'Licencia de conducir de Juan Pérez vence en 10 días',
        fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 10),
        critico: false,
        warning: true
      },
      {
        id: 3,
        tipo: 'vehiculo',
        descripcion: 'Seguro del vehículo ABC-123 vence el 15/12/2024',
        fecha: new Date(2024, 11, 15),
        critico: false,
        warning: false
      }
    ];

    return proximosVencimientos;
  };

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const response = await vehiculosService.getAll();
        setVehiculos(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchConductores = async () => {
      try {
        const response = await conductoresService.getAll();
        setConductores(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchViajes = async () => {
      try {
        const response = await viajesService.getAll();
        setViajes(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchVencimientos = async () => {
      try {
  
        // Llama a los tres endpoints en paralelo
        const [vehiculosRes, conductoresRes, viajesRes] = await Promise.all([
          vehiculoDocumentosService.getProximosVencimientos(30),
          conductorDocumentosService.getProximosVencimientos(30),
          viajesDocumentosService.getProximosVencimientos(30)
        ]);

        // Procesa y unifica los resultados
        const procesar = (docs, tipoEntidad) => docs.map(doc => {
          const fechaVenc = new Date(doc.fecha_vencimiento);
          const hoy = new Date();
          const diffDias = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
          if (diffDias < 0 || diffDias > 30) return null;
          return {
            tipo: doc.tipo_documento,
            fecha: fechaVenc,
            descripcion: doc.archivo_nombre,
            entidad: tipoEntidad,
            vehiculo: doc.id_vehiculo,
            conductor: doc.id_conductor,
            viaje: doc.viaje_id,
            critico: diffDias < 10,
            warning: diffDias >= 10 && diffDias <= 30
          };
        }).filter(Boolean);

        const vencimientosUnificados = [
          ...procesar(vehiculosRes.data, 'vehiculo'), 
          ...procesar(conductoresRes.data, 'conductor'),
          ...procesar(viajesRes.data, 'viaje')
        ];

        setVencimientos(vencimientosUnificados);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVehiculos();
    fetchConductores();
    fetchViajes();
    fetchVencimientos();
    
    // Generar actividad reciente
    setActividadReciente(generarActividadReciente());

    if (vencimientos.length === 0) {
      setVencimientos(generarProximosVencimientos());
    }
  }, []);

  const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('es-AR', options);
  };

  const getActividadIcon = (actividad) => {
    const Icon = actividad.icono;
    const colorClasses = {
      green: darkMode ? 'text-green-400' : 'text-green-600',
      blue: darkMode ? 'text-blue-400' : 'text-blue-600',
      yellow: darkMode ? 'text-yellow-400' : 'text-yellow-600',
      red: darkMode ? 'text-red-400' : 'text-red-600',
      purple: darkMode ? 'text-purple-400' : 'text-purple-600',
      indigo: darkMode ? 'text-indigo-400' : 'text-indigo-600'
    };
    
    return <Icon className={`h-5 w-5 ${colorClasses[actividad.color]}`} />;
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
              {actividadReciente.map((actividad) => (
                <div 
                  key={actividad.id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    actividad.color === 'green'
                      ? darkMode 
                        ? 'bg-green-900 border-green-500' 
                        : 'bg-green-50 border-green-500'
                      : actividad.color === 'blue'
                        ? darkMode 
                          ? 'bg-blue-900 border-blue-500' 
                          : 'bg-blue-50 border-blue-500'
                        : actividad.color === 'yellow'
                          ? darkMode 
                            ? 'bg-yellow-900 border-yellow-500' 
                            : 'bg-yellow-50 border-yellow-500'
                          : actividad.color === 'red'
                            ? darkMode 
                              ? 'bg-red-900 border-red-500' 
                              : 'bg-red-50 border-red-500'
                            : actividad.color === 'purple'
                              ? darkMode 
                                ? 'bg-purple-900 border-purple-500' 
                                : 'bg-purple-50 border-purple-500'
                              : darkMode 
                                ? 'bg-indigo-900 border-indigo-500' 
                                : 'bg-indigo-50 border-indigo-500'
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
                            actividad.color === 'green'
                              ? darkMode ? 'text-green-200' : 'text-green-800'
                              : actividad.color === 'blue'
                                ? darkMode ? 'text-blue-200' : 'text-blue-800'
                                : actividad.color === 'yellow'
                                  ? darkMode ? 'text-yellow-200' : 'text-yellow-800'
                                  : actividad.color === 'red'
                                    ? darkMode ? 'text-red-200' : 'text-red-800'
                                    : actividad.color === 'purple'
                                      ? darkMode ? 'text-purple-200' : 'text-purple-800'
                                      : darkMode ? 'text-indigo-200' : 'text-indigo-800'
                          }`}>
                            {actividad.titulo}
                          </p>
                          <p className={`text-xs mt-1 ${
                            actividad.color === 'green'
                              ? darkMode ? 'text-green-300' : 'text-green-600'
                              : actividad.color === 'blue'
                                ? darkMode ? 'text-blue-300' : 'text-blue-600'
                                : actividad.color === 'yellow'
                                  ? darkMode ? 'text-yellow-300' : 'text-yellow-600'
                                  : actividad.color === 'red'
                                    ? darkMode ? 'text-red-300' : 'text-red-600'
                                    : actividad.color === 'purple'
                                      ? darkMode ? 'text-purple-300' : 'text-purple-600'
                                      : darkMode ? 'text-indigo-300' : 'text-indigo-600'
                          }`}>
                            {actividad.descripcion}
                          </p>
                        </div>
                        <span className={`text-xs font-medium ${
                          actividad.color === 'green'
                            ? darkMode ? 'text-green-200' : 'text-green-800'
                            : actividad.color === 'blue'
                              ? darkMode ? 'text-blue-200' : 'text-blue-800'
                              : actividad.color === 'yellow'
                                ? darkMode ? 'text-yellow-200' : 'text-yellow-800'
                                : actividad.color === 'red'
                                  ? darkMode ? 'text-red-200' : 'text-red-800'
                                  : actividad.color === 'purple'
                                    ? darkMode ? 'text-purple-200' : 'text-purple-800'
                                    : darkMode ? 'text-indigo-200' : 'text-indigo-800'
                        }`}>
                          {actividad.tiempo}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={`mt-4 w-full text-sm py-2 rounded-lg ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}>
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
              value={vehiculos.length}
              darkMode={darkMode}
              icon={<FaTruck className="text-3xl" />}
              trend={vehiculos}
            />
            <DashboardCard 
              title="Conductores" 
              value={conductores.length} 
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
              </h2>
            </div>
            
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
          </div>

          {/* Panel de Vencimientos */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Vencimientos Próximos
            </h2>
            
            <div className="space-y-3">
              {vencimientos.slice(0, 5).map((vencimiento, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${vencimiento.critico ? darkMode ? 'bg-red-900 border-red-500' : 'bg-red-50 border-red-500' : darkMode ? 'bg-yellow-900 border-yellow-500' : 'bg-yellow-50 border-yellow-500'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium text-sm ${vencimiento.critico ? darkMode ? 'text-red-200' : 'text-red-800': darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                        {vencimiento.tipo}
                      </p>
                      <p className={`text-xs ${vencimiento.critico ? darkMode ? 'text-red-300' : 'text-red-600': darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                        {vencimiento.descripcion}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${vencimiento.critico ? darkMode ? 'text-red-200' : 'text-red-800' : darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                      {formatDate(vencimiento.fecha)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {vencimientos.length > 5 && (
              <button className={`mt-4 w-full text-sm py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                Ver todos ({vencimientos.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
