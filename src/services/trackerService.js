import api from './api'; 

export const trackerService = {
    obtenerUbicacionActual: (dispositivoId) => 
        api.get(`/tracker/tracker/dispositivo/${dispositivoId}/actual`),

    obtenerHistorialUbicaciones: (dispositivoId, fechaInicio, fechaFin) => 
        api.get(`/tracker/tracker/dispositivo/${dispositivoId}/historial`, {
            params: {
                fechaInicio,
                fechaFin
            }
        }),

    obtenerVehiculos: () => api.get('/vehiculos'),
    
    obtenerVehiculoPorId: (vehiculoId) => api.get(`/vehiculos/${vehiculoId}`),

    obtenerDispositivos: () => api.get('/dispositivos'),
    
    obtenerDispositivoPorId: (dispositivoId) => api.get(`/dispositivos/${dispositivoId}`),
};