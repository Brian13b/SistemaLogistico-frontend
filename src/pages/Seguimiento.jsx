import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { trackerService } from '../services/trackerService';

function Seguimiento() {
  const [vehiculos, setVehiculos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const mapRef = useRef();

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
    <div className="flex h-full">
      {/* Mapa - Lado izquierdo */}
      <div className="flex-1 border-r border-gray-200 z-50">
        <MapContainer
          center={[-32.055591, -60.603040]}
          zoom={16}
          className="h-full w-full"
          whenCreated={map => mapRef.current = map}
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
                  {ubicacion.patente} - {enMovimiento ? 'En movimiento' : 'Detenido'}
                </Tooltip>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{ubicacion.patente}</h3>
                    <p>{ubicacion.marca} {ubicacion.modelo}</p>
                    <p>Velocidad: {ubicacion.velocidad} km/h</p>
                    <p>Última actualización: {new Date(ubicacion.timestamp).toLocaleTimeString()}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Lista de vehículos */}
      <div className="w-80 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Flota de Vehículos</h2>
          <p className="text-sm text-gray-500">{vehiculos.length} vehículos registrados</p>
        </div>

        <div className="divide-y divide-gray-200">
          {vehiculos.map(vehiculo => {
            const ubicacion = ubicaciones.find(u => u.vehiculoId === vehiculo.id);
            const enMovimiento = ubicacion?.velocidad > 5;
            
            return (
              <div
                key={vehiculo.id}
                className={`p-4 cursor-pointer ${vehiculoSeleccionado === vehiculo.id ? 'bg-yellow-500 text-gray-700' : 'hover:bg-yellow-600'}`}
                onClick={() => seleccionarVehiculo(vehiculo.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vehiculo.patente}</p>
                    <p className="text-sm text-gray-600">{vehiculo.marca} {vehiculo.modelo}</p>
                  </div>
                  <span className={`text-lg ${enMovimiento ? 'text-green-500' : 'text-yellow-500'}`}>
                    {enMovimiento ? '➤' : '🅿'}
                  </span>
                </div>
                
                {ubicacion && (
                  <div className="mt-2 text-xs">
                    <p>Velocidad: {ubicacion.velocidad} km/h</p>
                    <p className="text-gray-500">
                      Actualizado: {new Date(ubicacion.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detalles del vehículo seleccionado */}
        {vehiculoSeleccionado && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-bold mb-2">Detalles del Vehículo</h3>
            {(() => {
              const vehiculo = vehiculos.find(v => v.id === vehiculoSeleccionado);
              const ubicacion = ubicaciones.find(u => u.vehiculoId === vehiculoSeleccionado);
              
              if (!vehiculo) return null;
              
              return (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Patente:</span> {vehiculo.patente}</p>
                  <p><span className="font-medium">Marca/Modelo:</span> {vehiculo.marca} {vehiculo.modelo}</p>
                  <p><span className="font-medium">Año:</span> {vehiculo.year}</p>
                  
                  {ubicacion ? (
                    <>
                      <p>
                        <span className="font-medium">Estado:</span> 
                        <span className={`ml-2 ${ubicacion.velocidad > 5 ? 'text-green-500' : 'text-yellow-500'}`}>
                          {ubicacion.velocidad > 5 ? 'En movimiento' : 'Detenido'}
                        </span>
                      </p>
                      <p><span className="font-medium">Velocidad:</span> {ubicacion.velocidad} km/h</p>
                      <p><span className="font-medium">Última ubicación:</span> {ubicacion.latitud}, {ubicacion.longitud}</p>
                      <p><span className="font-medium">Actualizado:</span> {new Date(ubicacion.timestamp).toLocaleString()}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">No hay datos de ubicación disponibles</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Seguimiento;