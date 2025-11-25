import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import FlyToVehiculo from '../components/FlyToVehiculo';
import { useMapaFlota } from '../hooks/useMapaFlota'; // <--- Importamos el Hook Nuevo

function Seguimiento() {
  const { darkMode } = useTheme();
  const { showInfo } = useNotification();
  
  // Usamos el Hook que creamos
  const { flota, loading } = useMapaFlota();
  
  const [vehiculoSeleccionadoId, setVehiculoSeleccionadoId] = useState(null);
  const mapRef = useRef(null);

  // Helper visual
  const crearIconoVehiculo = (enMovimiento) => {
    return L.divIcon({
      html: `<div style="font-size:20px">${enMovimiento ? '➤' : '🅿'}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: enMovimiento ? 'text-green-500' : 'text-yellow-500',
    });
  };

  const seleccionarVehiculo = (id) => {
    setVehiculoSeleccionadoId(id);
    const v = flota.find(item => item.id === id);
    if (v) showInfo(`Vehículo ${v.patente} seleccionado`);
  };

  // Obtener el objeto completo del seleccionado para el panel de detalles
  const vehiculoActivo = flota.find(v => v.id === vehiculoSeleccionadoId);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Sincronizando flota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full p-2 space-y-2 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="flex flex-1 space-x-2 h-full w-full">
        
        {/* --- MAPA --- */}
        <div className={`flex-1 rounded-lg shadow border overflow-hidden ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'} h-full w-full`}>
          <MapContainer
            center={[-32.94, -60.63]} // Rosario por defecto
            zoom={10}
            className="h-full w-full z-0"
            whenCreated={(map) => { mapRef.current = map; }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            {/* Componente para volar al vehículo seleccionado */}
            {vehiculoActivo && vehiculoActivo.ubicacion && (
              <FlyToVehiculo vehiculo={vehiculoActivo.ubicacion} />
            )}

            {/* Marcadores */}
            {flota.map((vehiculo) => (
              vehiculo.ubicacion && (
                <Marker
                  key={vehiculo.id}
                  position={[vehiculo.ubicacion.latitud, vehiculo.ubicacion.longitud]}
                  icon={crearIconoVehiculo(vehiculo.enMovimiento)}
                  eventHandlers={{click: () => seleccionarVehiculo(vehiculo.id)}}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="text-sm font-bold">
                      {vehiculo.patente} <br/>
                      <span className="font-normal">{vehiculo.conductorNombre}</span>
                    </div>
                  </Tooltip>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>

        {/* --- LISTA LATERAL --- */}
        <div className={`w-80 rounded-lg shadow border overflow-y-auto ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-400'}`}>
            <h2 className="text-lg font-bold">Flota ({flota.length})</h2>
          </div>

          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {flota.map((vehiculo) => (
              <div
                key={vehiculo.id}
                className={`p-4 cursor-pointer transition-colors ${
                  vehiculoSeleccionadoId === vehiculo.id 
                    ? 'bg-blue-600 text-white' 
                    : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
                onClick={() => seleccionarVehiculo(vehiculo.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{vehiculo.patente}</span>
                  {vehiculo.estadoTracking === 'ONLINE' ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">ONLINE</span>
                  ) : (
                    <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">OFFLINE</span>
                  )}
                </div>
                <p className="text-sm opacity-80">{vehiculo.marca} {vehiculo.modelo}</p>
                <p className="text-xs mt-1">👤 {vehiculo.conductorNombre}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- PANEL DE DETALLES INFERIOR --- */}
      {vehiculoActivo && (
        <div className={`h-[30%] rounded-lg shadow border px-6 py-4 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{vehiculoActivo.patente}</h2>
              <p className="text-lg opacity-75">{vehiculoActivo.marca} {vehiculoActivo.modelo}</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-60">Conductor</div>
              <div className="text-xl font-semibold">{vehiculoActivo.conductorNombre}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Datos de GPS */}
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h4 className="text-xs uppercase tracking-wider opacity-60 mb-2">Telemetría</h4>
              {vehiculoActivo.ubicacion ? (
                <div className="space-y-1">
                  <p>📡 <strong>Velocidad:</strong> {vehiculoActivo.ubicacion.velocidad} km/h</p>
                  <p>🧭 <strong>Rumbo:</strong> {vehiculoActivo.ubicacion.rumbo}°</p>
                  <p>⏱️ <strong>Actualizado:</strong> {new Date(vehiculoActivo.ubicacion.timestamp).toLocaleTimeString()}</p>
                </div>
              ) : (
                <p className="text-sm italic opacity-50">Sin datos de GPS recientes</p>
              )}
            </div>

            {/* Datos Técnicos */}
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h4 className="text-xs uppercase tracking-wider opacity-60 mb-2">Ficha Técnica</h4>
              <p><strong>Año:</strong> {vehiculoActivo.year || vehiculoActivo.anio}</p>
              <p><strong>Motor:</strong> {vehiculoActivo.tipo_motor || 'N/A'}</p>
              <p><strong>Tara:</strong> {vehiculoActivo.tara} kg</p>
            </div>

            {/* Estado Administrativo */}
            <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
               <h4 className="text-xs uppercase tracking-wider opacity-60 mb-2">Estado</h4>
               <p><strong>Estado:</strong> {vehiculoActivo.estado}</p>
               <p><strong>Odómetro:</strong> {vehiculoActivo.odometro_inicial || 'N/A'} km</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Seguimiento;