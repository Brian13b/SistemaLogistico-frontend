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
    condicion_iva_receptor_id: 1, // 1: Resp. Inscripto (Default)
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
    condicionesIVA: [], // Nuevo estado para ARCA
  });

  useEffect(() => {
    if (isOpen) {
      cargarParametros();
      if (viajeData?.precio) {
        calcularImportes(viajeData.precio, formData.voucher_type);
      }
    }
  }, [isOpen]);

  const cargarParametros = async () => {
    setLoadingParams(true);
    try {
      // Cargar todos los parámetros en paralelo
      const [
        tiposComprobante,
        puntosVenta,
        tiposDocumento,
        tiposIVA,
        tiposConcepto,
        condicionesIVA
      ] = await Promise.all([
        facturacionService.obtenerTiposComprobante(),
        facturacionService.obtenerPuntosVenta(),
        facturacionService.obtenerTiposDocumento(),
        facturacionService.obtenerTiposIVA(),
        facturacionService.obtenerTiposConcepto(),
        // Si este método falla (porque el backend es viejo), usamos array vacío para no romper todo
        facturacionService.obtenerCondicionesIvaReceptor().catch(() => ({ data: [] }))
      ]);

      setParametros({
        tiposComprobante: tiposComprobante.data || [],
        puntosVenta: puntosVenta.data || [],
        tiposDocumento: tiposDocumento.data || [],
        tiposIVA: tiposIVA.data || [],
        tiposConcepto: tiposConcepto.data || [],
        condicionesIVA: condicionesIVA.data || []
      });
    } catch (error) {
      console.error('Error al cargar parámetros:', error);
      showError('Error al cargar parámetros de AFIP');
    } finally {
      setLoadingParams(false);
    }
  };

  const calcularImportes = (total, tipoComprobante) => {
    const totalNum = parseFloat(total) || 0;
    
    // Para factura tipo A (con IVA discriminado - ID 1)
    // Nota: Usamos ID 1 hardcodeado para A, idealmente debería chequearse contra parametros
    if (parseInt(tipoComprobante) === 1) {
      // Calculamos neto dividiendo por 1.21
      const neto = totalNum / 1.21;
      // Redondeamos a 2 decimales
      const netoRedondeado = Math.round(neto * 100) / 100;
      // El IVA es la diferencia exacta para que sume el total
      const iva = totalNum - netoRedondeado;
      
      setFormData(prev => ({
        ...prev,
        total_amount: totalNum,
        net_amount: netoRedondeado,
        vat_amount: Math.round(iva * 100) / 100,
      }));
    } else {
      // Para factura tipo B (IVA incluido) o C
      setFormData(prev => ({
        ...prev,
        total_amount: totalNum,
        net_amount: totalNum, // En B/C el total va al neto para efectos de este form simple
        vat_amount: 0,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // Convertir a número si es un campo de importe o ID
      const isNumber = ['total_amount', 'sales_point', 'voucher_type', 'concept', 'doc_type', 'condicion_iva_receptor_id'].includes(name);
      const finalValue = isNumber ? (parseFloat(value) || 0) : value;
      
      const newData = { ...prev, [name]: finalValue };
      
      // Si cambia el total o el tipo, recalcular
      if (name === 'total_amount') {
        calcularImportes(finalValue, prev.voucher_type);
      }
      if (name === 'voucher_type') {
        calcularImportes(prev.total_amount, finalValue);
        
        // Autocompletar sugerencias según tipo
        if (parseInt(finalValue) === 1) { // Factura A
            newData.doc_type = 80; // CUIT
            newData.condicion_iva_receptor_id = 1; // Resp Inscripto
        } else if (parseInt(finalValue) === 6 || parseInt(finalValue) === 11) { // B o C
            newData.doc_type = 80; // Por defecto CUIT (o DNI)
            newData.condicion_iva_receptor_id = 5; // Consumidor Final
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.doc_number) {
          showError("Debe ingresar un número de documento");
          setLoading(false);
          return;
      }

      // Preparar datos para enviar con los tipos correctos (int/float)
      const facturaData = {
        viaje_id: formData.viaje_id,
        sales_point: parseInt(formData.sales_point),
        voucher_type: parseInt(formData.voucher_type),
        concept: parseInt(formData.concept),
        doc_type: parseInt(formData.doc_type),
        doc_number: formData.doc_number.toString(),
        condicion_iva_receptor_id: parseInt(formData.condicion_iva_receptor_id),
        
        total_amount: parseFloat(formData.total_amount),
        net_amount: parseFloat(formData.net_amount),
        vat_amount: parseFloat(formData.vat_amount),
        non_taxable_amount: 0,
        exempt_amount: 0,
        tributes_amount: 0,
        
        currency: 'PES',
        currency_rate: 1.0,
        
        // Fechas formateadas
        service_start_date: formatearFecha(formData.service_start_date),
        service_end_date: formatearFecha(formData.service_end_date),
        payment_due_date: formatearFecha(formData.payment_due_date) || formatearFecha(new Date()),
        
        // Agregar detalles de IVA solo si es Factura A y hay monto
        vat_details: (parseInt(formData.voucher_type) === 1 && formData.vat_amount > 0) ? [
          {
            id: 5, // ID 5 es 21%
            base_imp: parseFloat(formData.net_amount),
            importe: parseFloat(formData.vat_amount),
          }
        ] : null,
        
        tributes_details: []
      };

      const response = await facturacionService.emitirFactura(facturaData);
      
      showSuccess(`Factura ${response.data.numero} emitida exitosamente. CAE: ${response.data.cae}`);
      onClose(true);
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
    if (typeof fecha === 'string' && fecha.length === 8 && /^\d+$/.test(fecha)) return fecha;
    
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
              onClick={() => onClose(false)}
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
              {/* --- FILA 1: Comprobante y Punto de Venta --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Comprobante *
                  </label>
                  <select
                    name="voucher_type"
                    value={formData.voucher_type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  >
                    {parametros.tiposComprobante.map((tipo) => (
                      <option key={tipo.codigo} value={tipo.codigo}>{tipo.descripcion}</option>
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
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  >
                    {parametros.puntosVenta.map((pv) => (
                      <option key={pv.codigo} value={pv.codigo}>{pv.descripcion}</option>
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
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  >
                    {parametros.tiposConcepto.map((c) => (
                      <option key={c.codigo} value={c.codigo}>{c.descripcion}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* --- FILA 2: Cliente --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo Documento *
                  </label>
                  <select
                    name="doc_type"
                    value={formData.doc_type}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  >
                    {parametros.tiposDocumento.map((t) => (
                      <option key={t.codigo} value={t.codigo}>{t.descripcion}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número Documento *
                  </label>
                  <input
                    type="text"
                    name="doc_number"
                    value={formData.doc_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="CUIT/DNI sin guiones"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Condición IVA (Receptor) *
                  </label>
                  <select
                    name="condicion_iva_receptor_id"
                    value={formData.condicion_iva_receptor_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  >
                    {parametros.condicionesIVA.length > 0 ? (
                        parametros.condicionesIVA.map((c) => (
                        <option key={c.codigo} value={c.codigo}>{c.descripcion}</option>
                        ))
                    ) : (
                        <>
                            <option value={1}>IVA Responsable Inscripto</option>
                            <option value={5}>Consumidor Final</option>
                            <option value={6}>Responsable Monotributo</option>
                        </>
                    )}
                  </select>
                </div>
              </div>

              {/* --- FILA 3: Importes --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded bg-opacity-10 bg-blue-500">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    IMPORTE TOTAL *
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 rounded border font-bold text-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Neto Gravado (Calc)
                  </label>
                  <input
                    type="number"
                    value={formData.net_amount}
                    readOnly
                    className="w-full px-3 py-2 rounded border bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    IVA (21%)
                  </label>
                  <input
                    type="number"
                    value={formData.vat_amount}
                    readOnly
                    className="w-full px-3 py-2 rounded border bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* --- FILA 4: Fechas --- */}
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
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
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
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Vto. Pago
                  </label>
                  <input
                    type="date"
                    name="payment_due_date"
                    value={formData.payment_due_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className={`px-6 py-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  {loading ? 'Procesando en AFIP...' : 'Emitir Factura'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}