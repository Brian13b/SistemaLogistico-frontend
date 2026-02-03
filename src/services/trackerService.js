import api from './api'; 

export const trackerService = {
    obtenerUbicacionActual: (dispositivoId) => 
        api.get(`/v1/tracker/tracker/dispositivo/${dispositivoId}/actual`),

    obtenerDispositivos: () => api.get('/v1/dispositivos/'), 

    obtenerFlotaTiempoReal: () => api.get('/v1/tracker/tracker/tiempo-real'),

    obtenerHistorialUbicaciones: (dispositivoId, fechaInicio, fechaFin) => 
        api.get(`/v1/tracker/tracker/dispositivo/${dispositivoId}/historial`, {
            params: {
                fechaInicio,
                fechaFin
            }
        }),

    obtenerVehiculos: () => api.get('/v1/vehiculos'),
    
    obtenerVehiculoPorId: (vehiculoId) => api.get(`/v1/vehiculos/${vehiculoId}`),

    obtenerDispositivos: () => api.get('/v1/dispositivos'),
    
    obtenerDispositivoPorId: (dispositivoId) => api.get(`/v1/dispositivos/${dispositivoId}`),
};