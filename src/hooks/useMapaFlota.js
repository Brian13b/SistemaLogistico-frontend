import { useState, useEffect, useRef, useCallback } from 'react';
import { vehiculosService } from '../services/VehiculosService';
import { trackerService } from '../services/trackerService';
import { conductoresService } from '../services/ConductoresService';

export const useMapaFlota = () => {
  const [flota, setFlota] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const flotaBaseRef = useRef([]);

  const inicializarFlota = async () => {
    try {
      setLoading(true);
      const [vehiculosRes, conductoresRes] = await Promise.all([
        vehiculosService.getAll(),
        conductoresService.getAll()
      ]);

      const vehiculos = vehiculosRes.data || [];
      const conductores = conductoresRes.data || [];

      const baseProcesada = await Promise.all(
        vehiculos.map(async (v) => {
          const conductor = conductores.find(c => c.id === v.id_conductor);
          const nombreConductor = conductor 
            ? `${conductor.nombre} ${conductor.apellido}` 
            : 'Sin Conductor';

          let vehiculoTrack = null;
          try {
            const trackInfo = await trackerService.obtenerVehiculoPorId(v.id);
            if (trackInfo.data) vehiculoTrack = trackInfo.data;
          } catch (e) {
            console.warn(`No se pudo cargar info tracker para ${v.patente}`);
          }

          return {
            ...v,
            conductorNombre: nombreConductor,
            vehiculoTrack: vehiculoTrack, 
            ubicacion: null,
            estadoTracking: 'SIN_SEÑAL',
            enMovimiento: false
          };
        })
      );

      flotaBaseRef.current = baseProcesada;
      setFlota(baseProcesada);
      
      actualizarUbicaciones();

    } catch (err) {
      console.error("Error inicializando flota:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarUbicaciones = useCallback(async () => {
    if (flotaBaseRef.current.length === 0) return;

    const nuevaFlota = await Promise.all(
      flotaBaseRef.current.map(async (vehiculoBase) => {
        let ubicacion = null;
        let estadoTracking = 'SIN_SEÑAL';

        try {
          const trackRes = await trackerService.obtenerUbicacionActual(vehiculoBase.id);
          
          if (trackRes.data && trackRes.data.latitud) {
            ubicacion = trackRes.data;
            estadoTracking = 'ONLINE';
          }
        } catch (err) {
          estadoTracking = 'OFFLINE';
        }

        return {
          ...vehiculoBase,
          ubicacion: ubicacion,
          estadoTracking: estadoTracking,
          enMovimiento: ubicacion ? (ubicacion.velocidad > 5) : false
        };
      })
    );

    setFlota(nuevaFlota);
  }, []);

  useEffect(() => {
    inicializarFlota();
    
    const interval = setInterval(actualizarUbicaciones, 10000);
    return () => clearInterval(interval);
  }, [actualizarUbicaciones]);

  return { flota, loading, recargar: actualizarUbicaciones };
};