import api from './api';

export const vehiculoDocumentosService = {
    getAll: () => api.get(`/documentos_vehiculos`),

    getById: (documentoId) => api.get(`/documentos_vehiculos/${documentoId}`),

    create: (data) => {
        return api.post(`/documentos_vehiculos/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
    },
    getAllByVencimiento: () => api.get(`/documentos_vehiculos/vencidos`),

    update: (documentoId, data) => {
        const formData = new FormData();
        formData.append('documento_data', JSON.stringify(data.documento_data));
        if (data.archivo) {
            formData.append('archivo', data.archivo);
        }

        return api.put(`/documentos_vehiculos/${documentoId}`, formData, {
            headers: {
            'Content-Type': 'multipart/form-data'
            }
        });
    },

    delete: (documentoId) => api.delete(`/documentos_vehiculos/${documentoId}`),

    getAllByVehiculo: (vehiculoId) => api.get(`/documentos_vehiculos/vehiculos/${vehiculoId}`),

    getProximosVencimientos: (dias) => api.get(`/documentos_vehiculos/proximos_vencimientos/${dias}`),

    download: (documentoId) => api.get(`/documentos_vehiculos/${documentoId}/descargar`, {
        responseType: 'blob' 
    }),
};