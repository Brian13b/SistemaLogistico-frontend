/*
import api from './api';
import axios from 'axios';

export const trackerService = {
    obtenerUbicacionActual: (dispositivoId) => axios.get(`http://localhost:8002/api/v1/tracker/dispositivo/${dispositivoId}/actual`),

    obtenerHistorialUbicaciones: (dispositivoId, fechaInicio, fechaFin) => 
        api.get(`/v1/dispositivo/${dispositivoId}/historial`, {
            params: {
                fechaInicio,
                fechaFin
            }
        }),

    obtenerVehiculos: () => axios.get('http://localhost:8002/api/v1/vehiculos'),
    obtenerVehiculoPorId: (vehiculoId) => api.get(`/v1/vehiculos/${vehiculoId}`),

    obtenerDispositivos: () => api.get('/v1/dispositivos'),
    obtenerDispositivoPorId: (dispositivoId) => api.get(`/v1/dispositivos/${dispositivoId}`),
};*/

import api from './api'; 

export const trackerService = {
    obtenerUbicacionActual: (dispositivoId) => 
        api.get(`/tracker/dispositivo/${dispositivoId}/actual`),

    obtenerHistorialUbicaciones: (dispositivoId, fechaInicio, fechaFin) => 
        api.get(`/tracker/dispositivo/${dispositivoId}/historial`, {
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