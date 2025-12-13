import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import FlyToVehiculo from '../components/FlyToVehiculo';
import { useMapaFlota } from '../hooks/useMapaFlota';
import Direccion from '../components/Direccion';

function Seguimiento() {
  const { darkMode } = useTheme();
  const { showInfo } = useNotification();
  const { flota, loading } = useMapaFlota();
  
  const [vehiculoSeleccionadoId, setVehiculoSeleccionadoId] = useState(null);
  const mapRef = useRef(null);

  const obtenerRumbo = (grados) => {
    if (grados === undefined || grados === null) return 'Desc.';
    const val = Math.floor((grados / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
    return `${grados}° ${arr[(val % 16)]}`;
  };

  const crearIconoVehiculo = (enMovimiento) => {
    return L.divIcon({
      html: `<div style="font-size:24px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));">${enMovimiento ? '🚚' : '🅿️'}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: '',
    });
  };

  const vehiculosConTracker = flota.filter(v => 
    v.ubicacion && 
    v.ubicacion.latitud !== null && 
    v.ubicacion.latitud !== 0 && 
    v.ubicacion.longitud !== null
  );

  const seleccionarVehiculo = (id) => {
    setVehiculoSeleccionadoId(id);
    const v = flota.find(item => item.id === id);
    if (v) showInfo(`Vehículo ${v.patente} seleccionado`);
  };

  const cerrarDetalle = () => {
    setVehiculoSeleccionadoId(null);
  };

  const vehiculoActivo = vehiculosConTracker.find(v => v.id === vehiculoSeleccionadoId);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
         <div className="text-center">Cargando flota...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full p-2 space-y-2 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* CONTENEDOR PRINCIPAL: MAPA + LISTA */}
      <div className={`flex flex-col md:flex-row flex-1 md:space-x-2 space-y-2 md:space-y-0 h-full w-full overflow-hidden`}>
        
        {/* MAPA */}
        <div className={`flex-1 rounded-lg shadow border overflow-hidden ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'} relative min-h-[300px]`}>
          <MapContainer
            center={[-32.94, -60.63]} 
            zoom={10}
            className="h-full w-full z-0"
            whenCreated={(map) => { mapRef.current = map; }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            {vehiculoActivo && vehiculoActivo.ubicacion && (
              <FlyToVehiculo vehiculo={vehiculoActivo.ubicacion} />
            )}

            {vehiculosConTracker.map((vehiculo) => (
              vehiculo.ubicacion && vehiculo.ubicacion.latitud && (
                <Marker
                  key={vehiculo.id}
                  position={[vehiculo.ubicacion.latitud, vehiculo.ubicacion.longitud]}
                  icon={crearIconoVehiculo(vehiculo.enMovimiento)}
                  eventHandlers={{click: () => seleccionarVehiculo(vehiculo.id)}}
                >
                  <Tooltip direction="top" offset={[0, -15]} opacity={0.9}>
                    <div className="min-w-[220px] p-1 font-sans text-gray-800">
                      <div className="border-b-2 border-gray-200 pb-2 mb-2">
                        <h3 className="text-lg font-bold text-blue-700 m-0 leading-tight">
                          {vehiculo.patente}
                        </h3>
                        <span className="text-sm font-medium text-gray-500 uppercase">
                          ({vehiculo.conductorNombre || 'Sin Conductor'})
                        </span>
                      </div>

                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between">
                          <strong className="text-sm">Velocidad:</strong>
                          <span className={`text-sm font-bold ${vehiculo.ubicacion.velocidad > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {vehiculo.ubicacion.velocidad?.toFixed(1) || 0} km/h
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <strong>Ubicación:</strong>
                          <div className="text-xs text-gray-500 mt-0.5 pl-1 bg-gray-50 rounded p-1">
                            <Direccion 
                              lat={vehiculo.ubicacion.latitud} 
                              lng={vehiculo.ubicacion.longitud} 
                            />
                          </div>
                        </div>
                      </div>

                      <hr className="border-gray-200 my-2" />

                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <strong>Ult. Reporte:</strong>
                          <span>
                            {new Date(vehiculo.ubicacion.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <strong>Ult. Movimiento:</strong>
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                            {vehiculo.enMovimiento 
                              ? 'Ahora mismo' 
                              : (vehiculo.ultimo_movimiento 
                                  ? new Date(vehiculo.ultimo_movimiento).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                                  : '-')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>

        {/* LISTA LATERAL */}
        <div className={`
            w-full md:w-80 
            ${vehiculoActivo ? 'hidden md:block' : 'block'} 
            h-48 md:h-full 
            rounded-lg shadow border overflow-y-auto 
            ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-300'}
        `}>
          <div className={`p-4 border-b sticky top-0 z-10 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-400 bg-gray-100'}`}>
            <h2 className="text-lg font-bold">Flota ({vehiculosConTracker.length})</h2>
          </div>
          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {vehiculosConTracker.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className={`p-4 cursor-pointer transition-colors ${
                  vehiculoSeleccionadoId === vehiculo.id
                    ? (darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white')
                    : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200')
                }`}
                onClick={() => seleccionarVehiculo(vehiculo.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{vehiculo.patente}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${vehiculo.estadoTracking === 'ONLINE' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {vehiculo.estadoTracking}
                  </span>
                </div>
                <p className="text-sm opacity-80">{vehiculo.marca} {vehiculo.modelo}</p>
              </div>
            ))}
            {vehiculosConTracker.length === 0 && (
                <div className="p-4 text-center opacity-60">
                    No hay vehículos transmitiendo señal GPS.
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* FICHA INFERIOR */}
      {vehiculoActivo && (
        <div className={`relative rounded-lg shadow-lg border p-4 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-800'}`}>
          <button 
            onClick={cerrarDetalle}
            className={`absolute top-2 right-2 p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-colors`}
          >
            <FaTimes />
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-4 pr-8 border-b pb-2 border-gray-600/30">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-yellow-500' : 'text-blue-700'}`}>
              {vehiculoActivo.patente}
            </h2>
            <span className="text-lg font-semibold opacity-90">
              {vehiculoActivo.marca} {vehiculoActivo.modelo}
            </span>
            <span className={`text-sm md:ml-auto px-3 py-1 rounded-full font-medium`}>
              {vehiculoActivo.conductorNombre || 'Sin Conductor Asignado'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
            
            <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70">Fecha Reporte</span>
                <span className="font-mono font-bold">
                  {vehiculoActivo.ubicacion ? new Date(vehiculoActivo.ubicacion?.timestamp).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70 flex items-center gap-2">Velocidad</span>
                <span className="font-bold text-green-500">
                  {vehiculoActivo.ubicacion?.velocidad?.toFixed(1) || 0} km/h
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70 flex items-center gap-2">Ubicación</span>
                <span className="text-right truncate w-40">
                  <Direccion 
                    lat={vehiculoActivo.ubicacion?.latitud} 
                    lng={vehiculoActivo.ubicacion?.longitud} 
                  />
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70 flex items-center gap-2">Rumbo</span>
                <span>{obtenerRumbo(vehiculoActivo.ubicacion?.rumbo)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70">Año</span>
                <span>{vehiculoActivo.anio || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70">Motor / Comb.</span>
                <span>{vehiculoActivo.vehiculoTrack?.tipo_motor || 'Diesel'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70">Límite Vel.</span>
                <span>{vehiculoActivo.vehiculoTrack?.velocidad_maxima_permitida || '90'} km/h</span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70 flex items-center gap-2">Tara</span>
                <span>{vehiculoActivo.tara || 0} kg</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70">Estado</span>
                <span className={`font-bold ${vehiculoActivo.estado === 'Activo' ? 'text-green-500' : 'text-red-500'}`}>
                  {vehiculoActivo.estado}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70">Odómetro</span>
                <span>{vehiculoActivo.vehiculoTrack?.odometro_inicial?.toLocaleString() || 106780} km</span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70 flex items-center gap-2">Batería</span>
                <span>{vehiculoActivo.ubicacion?.voltaje_bateria || '24.5'} V</span>
              </div>
              <div className="flex justify-between border-b border-gray-500/20 pb-1">
                <span className="opacity-70 flex items-center gap-2">Temp. Motor</span>
                <span>{vehiculoActivo.ubicacion?.temperatura_motor || '85'}°C</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Seguimiento;