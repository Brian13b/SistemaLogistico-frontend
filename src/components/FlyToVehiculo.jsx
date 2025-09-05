import { useEffect } from "react";
import { useMap } from "react-leaflet";

function FlyToVehiculo({ vehiculo, zoom = 16 }) {
  const map = useMap();
  useEffect(() => {
    if (vehiculo?.latitud && vehiculo?.longitud) {
      map.flyTo([vehiculo.latitud, vehiculo.longitud], zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [vehiculo, map, zoom]);
  return null;
}
export default FlyToVehiculo;