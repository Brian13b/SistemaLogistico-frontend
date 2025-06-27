import api from "./api";

export const viajesService = {
    getAll: () => api.get("/viajes"),
    getById: (id) => api.get(`/viajes/${id}`),
    create: (data) => api.post("/viajes", data),
    update: (id, data) => api.put(`/viajes/${id}`, data),
    remove: (id) => api.delete(`/viajes/${id}`),
};