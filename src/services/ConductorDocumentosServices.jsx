import api from './api';

export const conductorDocumentosService = {
    create: (data) => {
        return api.post(`/documentos_conductores/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
    },
    update: (documentoId, data) => {
        const formData = new FormData();
        formData.append('documento_data', JSON.stringify(data.documento_data));
        if (data.archivo) {
            formData.append('archivo', data.archivo);
        }
    
        return api.put(`/documentos_conductores/${documentoId}`, formData, {
            headers: {
            'Content-Type': 'multipart/form-data'
            }
        });
    },
    getAll: () => api.get(`/documentos_conductores`),
    getById: (documentoId) => api.get(`/documentos_conductores/${documentoId}`),
    getAllByConductor: (conductorId) => api.get(`/documentos_conductores/conductor/${conductorId}`),
    getAllByVencimiento: () => api.get(`/documentos_conductores/vencidos`),
    delete: (documentoId) => api.delete(`/documentos_conductores/${documentoId}`),
    download: (documentoId) => api.get(`/documentos_conductores/${documentoId}/descargar`, {
        responseType: 'blob' 
    }),
};