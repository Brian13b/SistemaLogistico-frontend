import { useState, useEffect, useRef } from 'react';
import { vehiculosService } from '../services/VehiculosService';
import { trackerService } from '../services/trackerService';
import { conductoresService } from '../services/ConductoresService';

export const useMapaFlota = () => {
  const [flota, setFlota] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const cargarDatos = async () => {
    try {
      if (isFirstLoad.current) setLoading(true);

      const [vehiculosRes, conductoresRes] = await Promise.all([
        vehiculosService.getAll(),
        conductoresService.getAll()
      ]);

      const vehiculos = vehiculosRes.data || [];
      const conductores = conductoresRes.data || [];

      const flotaUnificada = await Promise.all(
        vehiculos.map(async (vehiculo) => {
          let ubicacion = null;
          let estadoTracking = 'SIN_SEÑAL';

          try {
            const trackRes = await trackerService.obtenerUbicacionActual(vehiculo.id);
            if (trackRes.data && trackRes.data.latitud) {
              ubicacion = trackRes.data;
              estadoTracking = 'ONLINE';
            }
          } catch (err) {
            estadoTracking = 'OFFLINE';
          }

          const conductor = conductores.find(c => c.id === vehiculo.conductor_id); 
          const nombreConductor = conductor 
            ? `${conductor.nombre} ${conductor.apellido}` 
            : 'Sin Conductor';

          return {
            ...vehiculo,
            conductorNombre: nombreConductor,
            ubicacion: ubicacion, 
            estadoTracking: estadoTracking,
            enMovimiento: ubicacion ? ubicacion.velocidad > 5 : false
          };
        })
      );

      setFlota(flotaUnificada);

    } catch (err) {
      console.error("Error general cargando flota:", err);
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000);
    return () => clearInterval(interval);
  }, []);

  return { flota, loading, recargar: cargarDatos };
};