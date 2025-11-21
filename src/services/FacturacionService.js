import axios from 'axios';

// Cliente axios específico para el servicio de facturación
const FACTURACION_API_URL = import.meta.env.VITE_FACTURACION_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:8003/api/facturas' : '/api/facturas');

const facturacionApi = axios.create({
  baseURL: FACTURACION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para JWT
facturacionApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const facturacionService = {
  // --- OPERACIONES PRINCIPALES ---
  emitirFactura: (data) => facturacionApi.post('/emitir', data),
  
  listarFacturas: (params = {}) => {
    const { skip = 0, limit = 50, viaje_id } = params;
    const queryParams = new URLSearchParams({ skip, limit });
    if (viaje_id) queryParams.append('viaje_id', viaje_id);
    return facturacionApi.get(`/?${queryParams}`);
  },
  
  obtenerFactura: (id) => facturacionApi.get(`/${id}`),
  
  consultarFactura: (data) => facturacionApi.post('/consultar', data),
  
  // --- PARÁMETROS AFIP ---
  obtenerTiposComprobante: () => facturacionApi.get('/parametros/tipos-comprobante'),
  obtenerPuntosVenta: () => facturacionApi.get('/parametros/puntos-venta'),
  obtenerTiposDocumento: () => facturacionApi.get('/parametros/tipos-documento'),
  obtenerTiposIVA: () => facturacionApi.get('/parametros/tipos-iva'),
  obtenerTiposConcepto: () => facturacionApi.get('/parametros/tipos-concepto'),
  obtenerCondicionesIvaReceptor: () => facturacionApi.get('/parametros/condiciones-iva-receptor'),
  
  // --- UTILIDADES Y ESTADO ---
  estadoServidores: () => facturacionApi.get('/estado/servidores'),

  // Obtener cotización
  obtenerCotizacion: (monedaId) => facturacionApi.get(`/parametros/cotizacion/${monedaId}`),

  // Verificar sincronización
  obtenerUltimoComprobante: (ptoVta, tipoCbte) => 
      facturacionApi.get(`/ultimo-comprobante/${ptoVta}/${tipoCbte}`),

  // Descargar PDF
  descargarFactura: async (id, numero) => {
        try {
            const response = await facturacionApi.get(`/${id}/pdf`, {
                responseType: 'blob' 
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Factura-${numero}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error("Error al descargar PDF", error);
            throw error;
        }
    },
};