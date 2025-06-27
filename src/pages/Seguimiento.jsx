import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
//import fetchVehicleLocations from '../services/vehicleService'; // Importa tu servicio de API para obtener ubicaciones
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

function Seguimiento({ darkMode }) {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchVehicleLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
      }
    };

    loadLocations();
    const interval = setInterval(loadLocations, 10000); // Actualiza cada 10 segundos
    return () => clearInterval(interval); 
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Seguimiento de Vehículos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} h-130`}>
            <MapContainer 
              center={[-32.055591, -60.603040]}
              zoom={16} 
              className="h-full w-full rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {locations.map((location) => (
                <Marker key={location.id} position={[location.lat, location.lng]}>
                  <Popup>
                    {location.vehiculo} <br /> {location.estado}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
        
        <div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} h-130 overflow-auto`}>
            <h2 className="text-lg font-semibold mb-4">Vehículos Activos</h2>
            <div className="space-y-4">
              {locations.map((location) => (
                <div 
                  key={location.id} 
                  className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center space-x-3`}
                >
                  <div className={`w-3 h-3 rounded-full bg-${location.estado === 'En ruta' ? 'green' : 'yellow'}-500`}></div>
                  <div>
                    <p className="font-medium">{location.vehiculo}</p>
                    <p className="text-sm">{location.ubicacion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Seguimiento;
