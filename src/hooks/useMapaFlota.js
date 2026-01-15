import { useState, useEffect, useRef, useCallback } from 'react';
import { vehiculosService } from '../services/VehiculosService';
import { trackerService } from '../services/trackerService';
import { conductoresService } from '../services/ConductoresService';

export const useMapaFlota = () => {
  const [flota, setFlota] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const estructuraFlotaRef = useRef([]);

  const inicializarFlota = async () => {
    try {
      setLoading(true);
      
      const [vehiculosRes, conductoresRes, dispositivosRes] = await Promise.all([
        vehiculosService.getAll(),      
        conductoresService.getAll(),   
        trackerService.obtenerDispositivos() 
      ]);

      const vehiculos = vehiculosRes.data || [];
      const conductores = conductoresRes.data || [];
      const dispositivos = dispositivosRes.data || [];

      const baseProcesada = vehiculos.map((v) => {
        const conductor = conductores.find(c => c.id === v.id_conductor);
        
        const dispositivo = dispositivos.find(d => d.vehiculo_id === v.id && d.activo);

        return {
          ...v, 
          conductorNombre: conductor ? `${conductor.nombre} ${conductor.apellido}` : 'Sin Conductor',
          
          dispositivo: dispositivo || null, 
          imei: dispositivo ? dispositivo.imei : null,
          
          ubicacion: null,
          estadoTracking: dispositivo ? 'SIN_SEÑAL' : 'NO_INSTALADO',
          enMovimiento: false
        };
      });

      estructuraFlotaRef.current = baseProcesada;
      setFlota(baseProcesada);
      
      actualizarUbicaciones();

    } catch (err) {
      console.error("Error inicializando flota:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarUbicaciones = useCallback(async () => {
    if (estructuraFlotaRef.current.length === 0) return;

    try {
      const res = await trackerService.obtenerFlotaTiempoReal();
      const ubicacionesLive = res.data || []; 
      
      const nuevaFlota = estructuraFlotaRef.current.map((vehiculo) => {
        if (!vehiculo.imei) return vehiculo;

        const match = ubicacionesLive.find(u => u.dispositivo_imei === vehiculo.imei);

        if (match && match.ubicacion) {
          const ultimoReporte = new Date(match.ubicacion.timestamp);
          const ahora = new Date();
          const diferenciaMinutos = (ahora - ultimoReporte) / 1000 / 60;

          const estado = diferenciaMinutos > 10 ? 'OFFLINE' : 'ONLINE';

          return {
            ...vehiculo,
            ubicacion: match.ubicacion,
            estadoTracking: estado, 
            enMovimiento: match.ubicacion.velocidad > 2 && estado === 'ONLINE',
            ultimo_movimiento: match.ubicacion.timestamp
          };
        }
        
        return {
          ...vehiculo,
          estadoTracking: 'OFFLINE' 
        };
      });

      setFlota(nuevaFlota);

    } catch (err) {
      console.error("Error polling ubicaciones:", err);
    }
  }, []);

  useEffect(() => {
    inicializarFlota();
    
    const interval = setInterval(actualizarUbicaciones, 10000); 
    
    return () => clearInterval(interval);
  }, [actualizarUbicaciones]);

  return { flota, loading, recargar: actualizarUbicaciones };
};