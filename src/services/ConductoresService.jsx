import api from './api';

export const conductoresService = {
  getAll: () => api.get('/conductores'),
  getById: (id) => api.get(`/conductores/${id}`),
  create: (data) => api.post('/conductores', data),
  update: (id, data) => api.put(`/conductores/${id}`, data),
  delete: (id) => api.delete(`/conductores/${id}`),
  getDocumentos: (id) => api.get(`/conductores/${id}/documentos`),
};