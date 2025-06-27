import api from './api';

export const viajesDocumentosService = {
    create: (data) => {
        return api.post(`/documentos_viajes/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
    },
    getAll: () => api.get(`/documentos_viajes`),
    getById: (documentoId) => api.get(`/documentos_viajes/${documentoId}`),
    getAllByViaje: (viajeId) => api.get(`/documentos_viajes/viajes/${viajeId}`),
    update: (documentoId, data) => {
        const formData = new FormData();
        formData.append('documento_data', JSON.stringify(data.documento_data));
        if (data.archivo) {
            formData.append('archivo', data.archivo);
        }
    
        return api.put(`/documentos_viajes/${documentoId}`, formData, {
            headers: {
            'Content-Type': 'multipart/form-data'
            }
        });
    },
    deleteDocumento: (documentoId) => api.delete(`/documentos_viajes/${documentoId}`),
    download: (documentoId) => api.get(`/documentos_viajes/${documentoId}/descargar`, {
        responseType: 'blob' 
    }),    
};