import api from './api';

export const finanzasService = {
  crearGasto: async (gastoData, archivo) => {
    const formData = new FormData();
    formData.append('gasto_data', JSON.stringify(gastoData));
    if (archivo) formData.append('archivo', archivo);

    return api.post('/gastos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  obtenerGastos: (filtros) => api.get('/gastos', { params: filtros }),

  crearIngreso: async (ingresoData, archivo) => {
    const formData = new FormData();
    formData.append('ingreso_data', JSON.stringify(ingresoData));
    if (archivo) formData.append('archivo', archivo);

    return api.post('/ingresos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  obtenerIngresos: (filtros) => api.get('/ingresos', { params: filtros }),
  
  obtenerResumen: (mes, anio) => api.get(`/finanzas/dashboard?mes=${mes}&anio=${anio}`)
};