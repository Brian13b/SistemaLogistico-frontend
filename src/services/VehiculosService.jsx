import api from './api';

export const vehiculosService = {
    getAll: () => api.get('/vehiculos/'),
    getById: (id) => api.get(`/vehiculos/${id}`),
    create: (data) => api.post('/vehiculos', data),
    update: (id, data) => api.put(`/vehiculos/${id}`, data),
    delete: (id) => api.delete(`/vehiculos/${id}`),
    };
