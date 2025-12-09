import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
    const val = Math.floor((grados / 45) + 0.5);
    const arr = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
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

  const seleccionarVehiculo = (id) => {
    setVehiculoSeleccionadoId(id);
    const v = flota.find(item => item.id === id);
    if (v) showInfo(`Vehículo ${v.patente} seleccionado`);
  };

  const vehiculoActivo = flota.find(v => v.id === vehiculoSeleccionadoId);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
         <div className="text-center">Cargando flota...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full p-2 space-y-2 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="flex flex-col md:flex-row flex-1 md:space-x-2 space-y-2 md:space-y-0 h-full w-full overflow-hidden">
        
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

            {flota.map((vehiculo) => (
              vehiculo.ubicacion && vehiculo.ubicacion.latitud && (
                <Marker
                  key={vehiculo.id}
                  position={[vehiculo.ubicacion.latitud, vehiculo.ubicacion.longitud]}
                  icon={crearIconoVehiculo(vehiculo.enMovimiento)}
                  eventHandlers={{click: () => seleccionarVehiculo(vehiculo.id)}}
                >
                  <Popup className="custom-popup">
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
                  </Popup>

                  <Tooltip direction="top" offset={[0, -15]} opacity={0.9}>
                    <span className="font-bold">{vehiculo.patente}</span>
                  </Tooltip>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>

        {/* LISTA LATERAL */}
        <div className={`w-full md:w-80 h-48 md:h-full rounded-lg shadow border overflow-y-auto ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
          <div className={`p-4 border-b sticky top-0 z-10 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-400 bg-gray-100'}`}>
            <h2 className="text-lg font-bold">Flota ({flota.length})</h2>
          </div>
          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {flota.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className={`p-4 cursor-pointer transition-colors ${vehiculoSeleccionadoId === vehiculo.id ? 'bg-blue-600 text-white' : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
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
          </div>
        </div>
      </div>

      {vehiculoActivo && (
        <div className={`h-auto max-h-[40vh] md:h-[30%] rounded-lg shadow border px-6 py-4 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{vehiculoActivo.patente}</h2>
              <p className="text-lg opacity-75">{vehiculoActivo.marca} {vehiculoActivo.modelo}</p>
            </div>
             <div className="text-right hidden sm:block">
              <div className="text-sm opacity-60">Conductor Asignado</div>
              <div className="text-xl font-semibold">{vehiculoActivo.conductorNombre}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
             {/* Datos GPS */}
             <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className="text-xs uppercase tracking-wider opacity-60 mb-2 font-bold">Telemetría</h4>
                <p>🚀 {vehiculoActivo.ubicacion?.velocidad?.toFixed(1) || 0} km/h</p>
                <p>🧭 {obtenerRumbo(vehiculoActivo.ubicacion?.rumbo)}</p> 
                <p>📡 {vehiculoActivo.ubicacion ? new Date(vehiculoActivo.ubicacion.timestamp).toLocaleTimeString() : '-'}</p>
             </div>
             
             {/* Datos Vehículo */}
             <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className="text-xs uppercase tracking-wider opacity-60 mb-2 font-bold">Ficha</h4>
                <p>📅 Año: {vehiculoActivo.anio || '-'}</p>
                <p>⛽ {vehiculoActivo.tipo_motor || 'Diesel'}</p>
                <p>⚖️ Tara: {vehiculoActivo.tara || 0} kg</p>
             </div>

             {/* Estado */}
             <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className="text-xs uppercase tracking-wider opacity-60 mb-2 font-bold">Estado</h4>
                <p>Estado: {vehiculoActivo.estado}</p>
                <p>Odómetro: {vehiculoActivo.odometro_inicial || 0} km</p> 
             </div>

             <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h4 className="text-xs uppercase tracking-wider opacity-60 mb-2 font-bold">Sensores</h4>
                <p>🔋 Batería: 24.5 V</p>
                <p>🌡️ Temp: 85°C</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Seguimiento;