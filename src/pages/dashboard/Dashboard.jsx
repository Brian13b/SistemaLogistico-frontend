import React, { use, useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard';
import DataTable from '../../components/common/DataTable';
import { vehiculosService } from '../../services/VehiculosService';
import { conductoresService } from '../../services/ConductoresService';
import { vehiculoDocumentosService } from '../../services/VehiculoDocumentosServices';
import { conductorDocumentosService } from '../../services/ConductorDocumentosServices';
import { viajesDocumentosService } from '../../services/ViajesDocumentosService';
import { viajesService } from '../../services/ViajesService';
import { FaTruck, FaUser, FaRoute, FaFilter, FaPlus } from 'react-icons/fa';
import { GraficoBarras } from '../../components/charts/GraficoBarras';
import { useTheme } from '../../context/ThemeContext';

export default function Dashboard({ userRole }) {
  const { darkMode } = useTheme();

  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);

  const data = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    datasets: [
      {
        label: "Gastos",
        data: [30, 40, 20, 5, 10, 15, 10, 0, 0, 0, 0, 0],
        backgroundColor: "rgb(251, 192, 45)",
        borderWidth: 1,
      },
    ],
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
            fecha: fechaVenc.toLocaleDateString('es-AR'),
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
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Columna izquierda - Resumen y Notificaciones */}
        <div className="md:col-span-1 space-y-6">
          {/* Panel de Resumen */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h2 className="text-lg font-semibold mb-4">Resumen General</h2>
            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              Bienvenido al sistema de gestión de viajes. Aquí puedes ver un resumen de los vehículos, conductores y viajes activos.
            </p>
            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
              Elige una opción del menú para comenzar a gestionar los viajes.
            </p>
            <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} italic`}>
              Si eres administrador, puedes gestionar los viajes, conductores y vehículos desde el perfil.
            </p>
          </div>
  
          {/* Panel de Notificaciones/Eventos */}
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Próximos Vencimientos</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${
                darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {vencimientos.length} pendientes
              </span>
            </div>
            
            <div className="space-y-3">
              {vencimientos.length > 0 ? (
                vencimientos.slice(0, 5).map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg flex items-start ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                    } border ${
                      darkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${
                      item.critico 
                        ? 'bg-red-500' 
                        : item.warning
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}></div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.tipo}</p>
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {item.fecha}
                        </span>
                      </div>
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                        {item.descripcion}
                      </p>
                      {item.entidad === 'vehiculo' && (
                        <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                          Vehículo ID: {item.vehiculo}
                        </p>
                      )}
                      {item.entidad === 'conductor' && (
                        <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                          Conductor ID: {item.conductor}
                        </p>
                      )}
                      {item.entidad === 'viaje' && (
                        <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                          Viaje ID: {item.viaje}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">
                  No hay vencimientos próximos
                </p>
              )}
            </div>
            
            {vencimientos.length > 5 && (
              <button className={`mt-4 w-full text-sm py-2 rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                Ver todos ({vencimientos.length})
              </button>
            )}
          </div>
        </div>
  
        {/* Columna derecha - Contenido principal */}
        <div className="md:col-span-1 space-y-6">
          {/* Tarjetas de Resumen */}
          <div className={`rounded-lg overflow-hidden p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} alingn-items-center`}>
            <GraficoBarras
              title="Ventas por mes" 
              data={data} 
              options={{ responsive: true }}
            />
          </div>
          {/* Tarjetas de Vehículos y Conductores */}
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
          <div className={`rounded-lg overflow-hidden p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
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
        </div>
      </div>
    </div>
  );
}
