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
  obtenerCondicionesIvaReceptor: () => facturacionApi.get('/parametros/condiciones-iva-receptor'),
  
  // Estado de servidores
  estadoServidores: () => facturacionApi.get('/estado/servidores'),

  descargarFactura: async (id, numero) => {
        try {
            const response = await facturacionApi.get(`/facturas/${id}/pdf`, {
                responseType: 'blob' // ¡CRUCIAL! Indica que esperamos un archivo
            });
            
            // Crear un link temporal para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            // Nombre del archivo sugerido
            link.setAttribute('download', `Factura-${numero}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error("Error al descargar PDF", error);
            throw error;
        }
    },
};

