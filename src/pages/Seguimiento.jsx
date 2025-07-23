import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { trackerService } from '../services/trackerService';

function Seguimiento({ darkMode }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const mapRef = useRef(null);

  // Crear ícono personalizado
  const crearIconoVehiculo = (enMovimiento) => {
    return L.divIcon({
      html: `<div style="font-size:20px">${enMovimiento ? '➤' : '🅿'}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: enMovimiento ? 'text-green-500' : 'text-yellow-500'
    });
  };

  // Obtener datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener lista de vehículos
        const respuestaVehiculos = await trackerService.obtenerVehiculos();
        setVehiculos(respuestaVehiculos.data);

        // Obtener ubicaciones de cada vehículo
        const ubicacionesPromesas = respuestaVehiculos.data.map(async vehiculo => {
          try {
            const respuestaUbicacion = await trackerService.obtenerUbicacionActual(vehiculo.id);
            return { 
              ...respuestaUbicacion.data, 
              vehiculoId: vehiculo.id,
              patente: vehiculo.patente,
              marca: vehiculo.marca,
              modelo: vehiculo.modelo
            };
          } catch {
            return null;
          }
        });

        const ubicacionesResultado = await Promise.all(ubicacionesPromesas);
        setUbicaciones(ubicacionesResultado.filter(Boolean));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000);
    return () => clearInterval(intervalo);
  }, []);

  // Manejar selección de vehículo
  const seleccionarVehiculo = (id) => {
    setVehiculoSeleccionado(id);

    const ubicacion = ubicaciones.find(u => u.vehiculoId === id);

    if (ubicacion && mapRef.current) {
      mapRef.current.flyTo([ubicacion.latitud, ubicacion.longitud], 16);
    }
  };

  return (
    <div className={`flex flex-col h-full p-2 space-y-2 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>

      {/* Mapa + Lista */}
      <div className="flex flex-1 space-x-2 h-full w-full">

        {/* Mapa */}
        <div className={`flex-1 rounded-lg shadow border overflow-hidden ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'} h-full w-full`}>
          <MapContainer
            center={[-32.055591, -60.603040]}
            zoom={16}
            className="h-full w-full"
            whenCreated={(map) => {
              mapRef.current = map;
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {ubicaciones.map(ubicacion => {
              const enMovimiento = ubicacion.velocidad > 5;
              return (
                <Marker
                  key={ubicacion.id}
                  position={[ubicacion.latitud, ubicacion.longitud]}
                  icon={crearIconoVehiculo(enMovimiento)}
                  eventHandlers={{
                    click: () => seleccionarVehiculo(ubicacion.vehiculoId)
                  }}
                >
                  <Tooltip>
                    <div className={`p-2 ${darkMode ? 'text-gray-800' : 'text-white'}`}>
                      <h3 className="font-bold text-lg mb-3">{ubicacion.patente}</h3>
                      <div className={`text-sm ${darkMode ? 'text-gray-700' : 'text-gray-600'}`}>
                        <p>Última actualización: {new Date(ubicacion.timestamp).toLocaleTimeString()}</p>
                        <p>Ubicación: {ubicacion.latitud}, {ubicacion.longitud}</p>
                        <p>{ubicacion.marca} {ubicacion.modelo}</p>
                        <p>Velocidad: {ubicacion.velocidad} km/h</p>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Lista de vehículos */}
        <div className={`w-80 rounded-lg shadow border overflow-y-auto ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-400'}`}>
            <h2 className="text-lg font-bold">Flota de Vehículos</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{vehiculos.length} vehículos registrados</p>
          </div>

          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {vehiculos.map(vehiculo => {
              const ubicacion = ubicaciones.find(u => u.vehiculoId === vehiculo.id);
              const enMovimiento = ubicacion?.velocidad > 5;

              return (
                <div
                  key={vehiculo.id}
                  className={`p-4 cursor-pointer ${
                    vehiculoSeleccionado === vehiculo.id
                      ? 'bg-yellow-500 text-gray-800'
                      : darkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-yellow-100'
                  }`}
                  onClick={() => seleccionarVehiculo(vehiculo.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{vehiculo.patente}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{vehiculo.marca} {vehiculo.modelo}</p>
                    </div>
                    <span className={`text-lg ${enMovimiento ? 'text-green-500' : 'text-yellow-500'}`}>
                      {enMovimiento ? '➤' : '🅿'}
                    </span>
                  </div>

                  {ubicacion && (
                    <div className="mt-2 text-xs">
                      <p>Velocidad: {ubicacion.velocidad} km/h</p>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Actualizado: {new Date(ubicacion.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detalles del vehículo */}
      {vehiculoSeleccionado && (
        <div
          className={`h-[30%] rounded-lg shadow border px-4 py-1 overflow-y-auto ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-800'
          }`}
        >
          <h3 className="font-bold text-lg">{vehiculoSeleccionado.patente}</h3>
          {(() => {
            const vehiculo = vehiculos.find((v) => v.id === vehiculoSeleccionado);
            const ubicacion = ubicaciones.find((u) => u.vehiculoId === vehiculoSeleccionado);

            if (!vehiculo) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {/* Columna 1 */}
                <div className="space-y-2">
                  <p><span className="font-medium">Último reporte:</span> {ubicacion ? new Date(ubicacion.timestamp).toLocaleString() : 'N/A'}</p>
                  <p><span className="font-medium">Velocidad:</span> {ubicacion ? `${ubicacion.velocidad} km/h` : 'N/A'}</p>
                  <p><span className="font-medium">Motor:</span> {ubicacion ? (ubicacion.mo ? 'Encendido' : 'Apagado') : 'N/A'}</p>
                  <p><span className="font-medium">Dirección:</span> {ubicacion ? ubicacion.direccion : 'N/A'}</p>
                  <p><span className="font-medium">Odómetro:</span> {vehiculo.odometro ?? 'N/A'} km</p>
                </div>

                {/* Columna 2 */}
                <div className="space-y-2">
                  <p><span className="font-medium">Patente:</span> {vehiculo.patente}</p>
                  <p><span className="font-medium">Marca:</span> {vehiculo.marca}</p>
                  <p><span className="font-medium">Modelo:</span> {vehiculo.modelo}</p>
                  <p><span className="font-medium">Límite velocidad:</span> {vehiculo.limiteVelocidad ?? 'N/A'} km/h</p>
                  <p><span className="font-medium">Consumo promedio:</span> {vehiculo.consumoPromedio ?? 'N/A'} km/l</p>
                </div>

                {/* Columna 3 */}
                <div className="space-y-2">
                  <p><span className="font-medium">Estado batería:</span> {vehiculo.bateria?.estado ?? 'N/A'}</p>
                  <p><span className="font-medium">Voltaje:</span> {vehiculo.bateria?.voltaje ?? 'N/A'} V</p>
                  <p><span className="font-medium">Nivel carga:</span> {vehiculo.bateria?.nivelCarga ?? 'N/A'}%</p>
                  <p><span className="font-medium">Última revisión:</span> {vehiculo.bateria?.ultimaRevision ? new Date(vehiculo.bateria.ultimaRevision).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default Seguimiento;