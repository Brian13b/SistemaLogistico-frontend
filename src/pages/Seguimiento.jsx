import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { trackerService } from '../services/trackerService';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import FlyToVehiculo from '../components/FlyToVehiculo';

function Seguimiento() {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [vehiculos, setVehiculos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const ubicacionesPrevias = useRef({});

  // Crear ícono personalizado
  const crearIconoVehiculo = (enMovimiento) => {
    return L.divIcon({
      html: `<div style="font-size:20px">${enMovimiento ? '➤' : '🅿'}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: enMovimiento ? 'text-green-500' : 'text-yellow-500',
    });
  };

  // Obtener datos iniciales + actualización periódica
  useEffect(() => {
    let primeraVez = true;

    const cargarDatos = async () => {
      try {
        if (primeraVez) setLoading(true);

        const respuestaVehiculos = await trackerService.obtenerVehiculos();
        setVehiculos(respuestaVehiculos.data);

        const ubicacionesPromesas = respuestaVehiculos.data.map(async (vehiculo) => {
          try {
            const respuestaUbicacion = await trackerService.obtenerUbicacionActual(vehiculo.id);

            if (!respuestaUbicacion?.data?.latitud || !respuestaUbicacion?.data?.longitud) {
              return null;
            }

            return {
              ...respuestaUbicacion.data,
              vehiculoId: vehiculo.id,
              patente: vehiculo.patente,
              marca: vehiculo.marca,
              modelo: vehiculo.modelo,
            };
          } catch (error) {
            console.warn(`No se pudo obtener ubicación para ${vehiculo.patente}:`, error);
            return null;
          }
        });

        const ubicacionesResultado = await Promise.all(ubicacionesPromesas);
        const ubicacionesValidas = ubicacionesResultado.filter(Boolean);

        // Actualizar solo markers sin mover el mapa
        ubicacionesValidas.forEach((u) => {
          const previa = ubicacionesPrevias.current[u.vehiculoId];
          if (previa) {
            // Si cambió la posición, actualizar referencia
            if (previa.latitud !== u.latitud || previa.longitud !== u.longitud) {
              ubicacionesPrevias.current[u.vehiculoId] = { latitud: u.latitud, longitud: u.longitud };
            }
          } else {
            ubicacionesPrevias.current[u.vehiculoId] = { latitud: u.latitud, longitud: u.longitud };
          }
        });

        setUbicaciones(ubicacionesValidas);

        if (primeraVez) {
          if (ubicacionesValidas.length > 0) {
            showSuccess(`${ubicacionesValidas.length} vehículos con ubicación actualizada`);
          } else {
            showWarning('No se pudo obtener ubicaciones de los vehículos');
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (primeraVez) showError('Error al cargar los datos de seguimiento');
      } finally {
        if (primeraVez) {
          setLoading(false);
          primeraVez = false;
        }
      }
    };

    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000);
    return () => clearInterval(intervalo);
  }, []);

  // Manejar selección de vehículo
  const seleccionarVehiculo = (id) => {
    setVehiculoSeleccionado(id);
    const ubicacion = ubicaciones.find((u) => u.vehiculoId === id);
    const vehiculo = vehiculos.find((v) => v.id === id);

    if (ubicacion) {
      ubicacionesPrevias.current[id] = { latitud: ubicacion.latitud, longitud: ubicacion.longitud };
      showInfo(`Vehículo ${vehiculo?.patente} seleccionado`);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-full ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando datos de seguimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full p-2 space-y-2 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
      }`}
    >
      <div className="flex flex-1 space-x-2 h-full w-full">
        {/* Mapa */}
        <div
          className={`flex-1 rounded-lg shadow border overflow-hidden ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
          } h-full w-full`}
        >
          <MapContainer
            center={[-32.055591, -60.60304]}
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

            {vehiculoSeleccionado && (
              <FlyToVehiculo
                vehiculo={ubicaciones.find((u) => u.vehiculoId === vehiculoSeleccionado)}
              />
            )}

            {/* Markers */}
            {ubicaciones.map((ubicacion) => {
              const enMovimiento = ubicacion.velocidad > 5;
              return (
                <Marker
                  key={ubicacion.id ?? ubicacion.vehiculoId}
                  position={[ubicacion.latitud, ubicacion.longitud]}
                  icon={crearIconoVehiculo(enMovimiento)}
                  eventHandlers={{
                    click: () => seleccionarVehiculo(ubicacion.vehiculoId),
                  }}
                >
                  <Tooltip>
                    <div className={`p-2 ${darkMode ? 'text-gray-800' : 'text-white'}`}>
                      <h3 className="font-bold text-lg mb-3">{ubicacion.patente}</h3>
                      <div
                        className={`text-sm ${darkMode ? 'text-gray-700' : 'text-gray-600'}`}
                      >
                        <p>
                          Última actualización:{' '}
                          {ubicacion.timestamp
                            ? new Date(ubicacion.timestamp).toLocaleTimeString()
                            : 'N/A'}
                        </p>
                        <p>
                          Ubicación: {ubicacion.latitud}, {ubicacion.longitud}
                        </p>
                        <p>
                          {ubicacion.marca} {ubicacion.modelo}
                        </p>
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
        <div
          className={`w-80 rounded-lg shadow border overflow-y-auto ${
            darkMode
              ? 'bg-gray-800 text-white border-gray-700'
              : 'bg-gray-100 text-gray-800 border-gray-300'
          }`}
        >
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-400'}`}>
            <h2 className="text-lg font-bold">Flota de Vehículos</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {vehiculos.length} vehículos registrados
            </p>
          </div>

          <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {vehiculos.map((vehiculo) => {
              const ubicacion = ubicaciones.find((u) => u.vehiculoId === vehiculo.id);
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
                      <p
                        className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {vehiculo.marca} {vehiculo.modelo}
                      </p>
                    </div>
                    <span
                      className={`text-lg ${enMovimiento ? 'text-green-500' : 'text-yellow-500'}`}
                    >
                      {enMovimiento ? '➤' : '🅿'}
                    </span>
                  </div>

                  {ubicacion && (
                    <div className="mt-2 text-xs">
                      <p>Velocidad: {ubicacion.velocidad} km/h</p>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Actualizado:{' '}
                        {ubicacion.timestamp
                          ? new Date(ubicacion.timestamp).toLocaleTimeString()
                          : 'N/A'}
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
          {/* Detalles internos mantienen tu código original */}
          {(() => {
            const vehiculo = vehiculos.find((v) => v.id === vehiculoSeleccionado);
            const ubicacion = ubicaciones.find((u) => u.vehiculoId === vehiculoSeleccionado);

            if (!vehiculo) return <p>No se encontró información del vehículo.</p>;

            return (
              <>
                <h3 className="font-bold text-lg">{vehiculo.patente}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Columnas 1,2,3 mantienen tu código original */}
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Último reporte:</span>{' '}
                      {ubicacion ? new Date(ubicacion.timestamp).toLocaleString() : 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Velocidad:</span>{' '}
                      {ubicacion ? `${ubicacion.velocidad} km/h` : 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Motor:</span>{' '}
                      {ubicacion ? (ubicacion.estado_motor ? 'Encendido' : 'Apagado') : 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span>{' '}
                      {ubicacion?.direccion ?? 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Odómetro:</span>{' '}
                      {vehiculo.odometro ?? 'N/A'} km
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Patente:</span> {vehiculo.patente}
                    </p>
                    <p>
                      <span className="font-medium">Marca:</span> {vehiculo.marca}
                    </p>
                    <p>
                      <span className="font-medium">Modelo:</span> {vehiculo.modelo}
                    </p>
                    <p>
                      <span className="font-medium">Límite velocidad:</span>{' '}
                      {vehiculo.limiteVelocidad ?? 'N/A'} km/h
                    </p>
                    <p>
                      <span className="font-medium">Consumo promedio:</span>{' '}
                      {vehiculo.consumoPromedio ?? 'N/A'} km/l
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Estado batería:</span>{' '}
                      {vehiculo.bateria?.estado ?? 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Voltaje:</span>{' '}
                      {vehiculo.bateria?.voltaje ?? 'N/A'} V
                    </p>
                    <p>
                      <span className="font-medium">Nivel carga:</span>{' '}
                      {vehiculo.bateria?.nivelCarga ?? 'N/A'}%
                    </p>
                    <p>
                      <span className="font-medium">Última revisión:</span>{' '}
                      {vehiculo.bateria?.ultimaRevision
                        ? new Date(vehiculo.bateria.ultimaRevision).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default Seguimiento;