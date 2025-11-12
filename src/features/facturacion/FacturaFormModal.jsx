import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { facturacionService } from '../../services/FacturacionService';

export default function FacturaFormModal({ isOpen, onClose, viajeId = null, viajeData = null }) {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingParams, setLoadingParams] = useState(true);
  const [formData, setFormData] = useState({
    viaje_id: viajeId,
    sales_point: 1,
    voucher_type: 1, // 1: Factura A, 6: Factura B
    concept: 2, // 2: Servicios (por defecto para viajes)
    doc_type: 80, // 80: CUIT
    doc_number: '',
    total_amount: viajeData?.precio || 0,
    net_amount: 0,
    vat_amount: 0,
    non_taxable_amount: 0,
    exempt_amount: 0,
    tributes_amount: 0,
    currency: 'PES',
    currency_rate: 1.0,
    service_start_date: viajeData?.fecha_salida || '',
    service_end_date: viajeData?.fecha_llegada || '',
    payment_due_date: '',
  });

  const [parametros, setParametros] = useState({
    tiposComprobante: [],
    puntosVenta: [],
    tiposDocumento: [],
    tiposIVA: [],
    tiposConcepto: [],
  });

  useEffect(() => {
    if (isOpen) {
      cargarParametros();
      // Calcular importes iniciales si hay precio del viaje
      if (viajeData?.precio) {
        calcularImportes(viajeData.precio);
      }
    }
  }, [isOpen]);

  const cargarParametros = async () => {
    setLoadingParams(true);
    try {
      const [
        tiposComprobante,
        puntosVenta,
        tiposDocumento,
        tiposIVA,
        tiposConcepto,
      ] = await Promise.all([
        facturacionService.obtenerTiposComprobante(),
        facturacionService.obtenerPuntosVenta(),
        facturacionService.obtenerTiposDocumento(),
        facturacionService.obtenerTiposIVA(),
        facturacionService.obtenerTiposConcepto(),
      ]);

      setParametros({
        tiposComprobante: tiposComprobante.data || [],
        puntosVenta: puntosVenta.data || [],
        tiposDocumento: tiposDocumento.data || [],
        tiposIVA: tiposIVA.data || [],
        tiposConcepto: tiposConcepto.data || [],
      });
    } catch (error) {
      console.error('Error al cargar parámetros:', error);
      showError('Error al cargar parámetros de AFIP');
    } finally {
      setLoadingParams(false);
    }
  };

  const calcularImportes = (total) => {
    // Para factura tipo A (con IVA discriminado)
    if (formData.voucher_type === 1) {
      const neto = total / 1.21;
      const iva = total - neto;
      setFormData(prev => ({
        ...prev,
        total_amount: total,
        net_amount: Math.round(neto * 100) / 100,
        vat_amount: Math.round(iva * 100) / 100,
      }));
    } else {
      // Para factura tipo B (IVA incluido)
      setFormData(prev => ({
        ...prev,
        total_amount: total,
        net_amount: total / 1.21,
        vat_amount: total - (total / 1.21),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: name.includes('amount') ? parseFloat(value) || 0 : value };
      
      // Si cambia el total, recalcular importes
      if (name === 'total_amount' || name === 'voucher_type') {
        calcularImportes(newData.total_amount);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para enviar
      const facturaData = {
        ...formData,
        // Agregar detalles de IVA si es factura tipo A
        vat_details: formData.voucher_type === 1 && formData.vat_amount > 0 ? [
          {
            id: 5, // 21% por defecto
            base_imp: formData.net_amount,
            importe: formData.vat_amount,
          }
        ] : null,
        // Formatear fechas si están en formato diferente
        service_start_date: formatearFecha(formData.service_start_date),
        service_end_date: formatearFecha(formData.service_end_date),
        payment_due_date: formatearFecha(formData.payment_due_date) || formatearFecha(new Date()),
      };

      const response = await facturacionService.emitirFactura(facturaData);
      
      showSuccess(`Factura ${response.data.numero} emitida exitosamente. CAE: ${response.data.cae}`);
      onClose(true); // Pasar true para indicar que se emitió una factura
    } catch (error) {
      console.error('Error al emitir factura:', error);
      const errorMessage = error.response?.data?.detail || 'Error al emitir la factura';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    
    // Si ya está en formato AAAAMMDD
    if (typeof fecha === 'string' && fecha.length === 8 && /^\d+$/.test(fecha)) {
      return fecha;
    }
    
    // Si es una fecha ISO o similar
    const date = new Date(fecha);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }
    
    return fecha;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4`}>
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Emitir Factura {viajeId && `(Viaje #${viajeId})`}
            </h2>
            <button
              onClick={onClose}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-2xl`}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {loadingParams ? (
            <div className="text-center py-8">
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Cargando parámetros de AFIP...</p>
            </div>
          ) : (
            <>
              {/* Información del comprobante */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Comprobante *
                  </label>
                  <select
                    name="voucher_type"
                    value={formData.voucher_type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    {parametros.tiposComprobante.map((tipo) => (
                      <option key={tipo.codigo} value={tipo.codigo}>
                        {tipo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Punto de Venta *
                  </label>
                  <select
                    name="sales_point"
                    value={formData.sales_point}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    {parametros.puntosVenta.map((pv) => (
                      <option key={pv.codigo} value={pv.codigo}>
                        {pv.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Concepto *
                  </label>
                  <select
                    name="concept"
                    value={formData.concept}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    {parametros.tiposConcepto.map((concepto) => (
                      <option key={concepto.codigo} value={concepto.codigo}>
                        {concepto.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Documento *
                  </label>
                  <select
                    name="doc_type"
                    value={formData.doc_type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    {parametros.tiposDocumento.map((tipo) => (
                      <option key={tipo.codigo} value={tipo.codigo}>
                        {tipo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    name="doc_number"
                    value={formData.doc_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="12345678901"
                    required
                  />
                </div>
              </div>

              {/* Importes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Importe Total *
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Importe Neto
                  </label>
                  <input
                    type="number"
                    name="net_amount"
                    value={formData.net_amount.toFixed(2)}
                    readOnly
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-600 border-gray-600 text-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    IVA
                  </label>
                  <input
                    type="number"
                    name="vat_amount"
                    value={formData.vat_amount.toFixed(2)}
                    readOnly
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-600 border-gray-600 text-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}
                  />
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha Inicio Servicio
                  </label>
                  <input
                    type="date"
                    name="service_start_date"
                    value={formData.service_start_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha Fin Servicio
                  </label>
                  <input
                    type="date"
                    name="service_end_date"
                    value={formData.service_end_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha Vencimiento Pago
                  </label>
                  <input
                    type="date"
                    name="payment_due_date"
                    value={formData.payment_due_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-2 rounded ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading ? 'Emitiendo...' : 'Emitir Factura'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

