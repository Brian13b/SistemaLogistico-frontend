import axios from 'axios';

// Cliente axios específico para el servicio de facturación
// En desarrollo local: usa el puerto directo
// En producción/Docker: debería usar el gateway o la URL configurada
const FACTURACION_API_URL = import.meta.env.VITE_FACTURACION_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:8003/api/facturas' : '/api/facturas');

const facturacionApi = axios.create({
  baseURL: FACTURACION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para JWT (si es necesario en el futuro)
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
  // Emitir una factura
  emitirFactura: (data) => facturacionApi.post('/emitir', data),
  
  // Listar facturas
  listarFacturas: (params = {}) => {
    const { skip = 0, limit = 50, viaje_id } = params;
    const queryParams = new URLSearchParams({ skip, limit });
    if (viaje_id) queryParams.append('viaje_id', viaje_id);
    return facturacionApi.get(`/?${queryParams}`);
  },
  
  // Obtener una factura por ID
  obtenerFactura: (id) => facturacionApi.get(`/${id}`),
  
  // Consultar factura en AFIP
  consultarFactura: (data) => facturacionApi.post('/consultar', data),
  
  // Obtener parámetros de AFIP
  obtenerTiposComprobante: () => facturacionApi.get('/parametros/tipos-comprobante'),
  obtenerPuntosVenta: () => facturacionApi.get('/parametros/puntos-venta'),
  obtenerTiposDocumento: () => facturacionApi.get('/parametros/tipos-documento'),
  obtenerTiposIVA: () => facturacionApi.get('/parametros/tipos-iva'),
  obtenerTiposConcepto: () => facturacionApi.get('/parametros/tipos-concepto'),
  
  // Estado de servidores
  estadoServidores: () => facturacionApi.get('/estado/servidores'),
};

