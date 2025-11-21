import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { facturacionService } from '../../services/FacturacionService';

export default function FacturaFormModal({ isOpen, onClose, viajeId = null, viajeData = null }) {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingParams, setLoadingParams] = useState(true);
  
  // Estados para el cálculo de ítems (Tu nuevo requerimiento)
  const [calculadora, setCalculadora] = useState({
    cantidad: 1,
    precioUnitario: viajeData?.precio || 0,
    unidad: 'Unidad', // Solo visual/interno por ahora
    alicuotaIVA: 21 // Por defecto 21%
  });

  // Estado del formulario principal (Estructura AFIP)
  const [formData, setFormData] = useState({
    viaje_id: viajeId,
    sales_point: 1,
    voucher_type: 1, // 1: Factura A, 6: Factura B
    concept: 2, // 2: Servicios
    doc_type: 80, // 80: CUIT
    doc_number: '',
    condicion_iva_receptor_id: 1,
    can_mis_mon_ext: 'N',
    
    // Estos se calcularán automáticamente
    total_amount: 0,
    net_amount: 0,
    vat_amount: 0,
    
    // Campos opcionales inicializados en 0
    non_taxable_amount: 0,
    exempt_amount: 0,
    tributes_amount: 0,
    
    currency: 'PES',
    currency_rate: 1.0,
    
    // Fechas
    service_start_date: viajeData?.fecha_salida || '',
    service_end_date: viajeData?.fecha_llegada || '',
    payment_due_date: '',
  });

  const [parametros, setParametros] = useState({
    tiposComprobante: [],
    puntosVenta: [],
    tiposDocumento: [],
    tiposIVA: [], // Para llenar el select de alícuotas
    tiposConcepto: [],
    condicionesIVA: [],
  });

  useEffect(() => {
    if (isOpen) {
      cargarParametros();
    }
  }, [isOpen]);

  // Efecto para recalcular cuando cambian los inputs de la calculadora o el tipo de comprobante
  useEffect(() => {
    recalcularTotales();
  }, [calculadora, formData.voucher_type, formData.tributes_amount, formData.exempt_amount]);

  const cargarParametros = async () => {
    setLoadingParams(true);
    try {
      const [
        tiposComprobante, puntosVenta, tiposDocumento, tiposIVA, tiposConcepto, condicionesIVA
      ] = await Promise.all([
        facturacionService.obtenerTiposComprobante(),
        facturacionService.obtenerPuntosVenta(),
        facturacionService.obtenerTiposDocumento(),
        facturacionService.obtenerTiposIVA(),
        facturacionService.obtenerTiposConcepto(),
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

  const recalcularTotales = () => {
    const cant = parseFloat(calculadora.cantidad) || 0;
    const precio = parseFloat(calculadora.precioUnitario) || 0;
    const netoCalculado = cant * precio;

    // Lógica de IVA según tipo de comprobante
    let ivaCalculado = 0;
    const esFacturaA = parseInt(formData.voucher_type) === 1;

    if (esFacturaA) {
      // En Factura A, el precio unitario suele ser NETO, y el IVA se suma
      ivaCalculado = netoCalculado * (calculadora.alicuotaIVA / 100);
    } else {
      // En Factura B (Consumidor Final), el precio unitario suele incluir IVA
      // Pero para mantener la consistencia con tu pedido de "se saca el precio y a eso se le suma el iva"
      // asumiremos que ingresas NETO y sumamos IVA, pero en B el "neto gravado" es el total/1.21
      // Simplificación: Tratamos el input siempre como NETO para el cálculo
      ivaCalculado = netoCalculado * (calculadora.alicuotaIVA / 100);
    }

    const otrosTributos = parseFloat(formData.tributes_amount) || 0;
    const exento = parseFloat(formData.exempt_amount) || 0;
    const noGravado = parseFloat(formData.non_taxable_amount) || 0;

    const totalFinal = netoCalculado + ivaCalculado + otrosTributos + exento + noGravado;

    setFormData(prev => ({
      ...prev,
      net_amount: parseFloat(netoCalculado.toFixed(2)),
      vat_amount: parseFloat(ivaCalculado.toFixed(2)),
      total_amount: parseFloat(totalFinal.toFixed(2))
    }));
  };

  const handleCalculadoraChange = (e) => {
    const { name, value } = e.target;
    setCalculadora(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  const handleUnitChange = (e) => {
      setCalculadora(prev => ({ ...prev, unidad: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Si cambia el tipo de comprobante, ajustamos defaults
      if (name === 'voucher_type') {
        const tipo = parseInt(value);
        return {
            ...prev,
            [name]: tipo,
            doc_type: tipo === 1 ? 80 : 96, // 80 CUIT para A, 96 DNI para B
            condicion_iva_receptor_id: tipo === 1 ? 1 : 5 // 1 Resp Inscripto, 5 Consumidor Final
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.doc_number) {
          showError("Debe ingresar un número de documento");
          setLoading(false);
          return;
      }

      // Mapeo de alícuota a ID de AFIP (5=21%, 4=10.5%, 3=0%)
      const alicuotaMap = { 21: 5, 10.5: 4, 27: 6, 0: 3 };
      const idAlicuota = alicuotaMap[calculadora.alicuotaIVA] || 5;

      const facturaData = {
        ...formData,
        sales_point: parseInt(formData.sales_point),
        voucher_type: parseInt(formData.voucher_type),
        concept: parseInt(formData.concept),
        doc_type: parseInt(formData.doc_type),
        doc_number: formData.doc_number.toString(),
        condicion_iva_receptor_id: parseInt(formData.condicion_iva_receptor_id),
        
        // Importes numéricos
        total_amount: parseFloat(formData.total_amount),
        net_amount: parseFloat(formData.net_amount),
        vat_amount: parseFloat(formData.vat_amount),
        non_taxable_amount: parseFloat(formData.non_taxable_amount),
        exempt_amount: parseFloat(formData.exempt_amount),
        tributes_amount: parseFloat(formData.tributes_amount),
        
        // Fechas formateadas
        service_start_date: formatearFecha(formData.service_start_date),
        service_end_date: formatearFecha(formData.service_end_date),
        payment_due_date: formatearFecha(formData.payment_due_date) || formatearFecha(new Date()),
        
        // Detalle de IVA (Solo si es Factura A o hay importe de IVA)
        vat_details: (formData.vat_amount > 0) ? [
          {
            id: idAlicuota,
            base_imp: parseFloat(formData.net_amount),
            importe: parseFloat(formData.vat_amount),
          }
        ] : null,
        
        tributes_details: [] // Dejamos vacío por ahora para simplificar
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

  // Estilos comunes
  const inputClass = `w-full px-3 py-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
  const labelClass = `block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto m-4`}>
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Emitir Factura AFIP {viajeId && `(Viaje #${viajeId})`}
            </h2>
            <button onClick={() => onClose(false)} className="text-2xl">&times;</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {loadingParams ? (
            <p className="text-center">Cargando parámetros...</p>
          ) : (
            <>
              {/* SECCIÓN 1: DATOS DEL COMPROBANTE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Punto de Venta *</label>
                  <select name="sales_point" value={formData.sales_point} onChange={handleChange} className={inputClass} required>
                    {parametros.puntosVenta.map(p => <option key={p.codigo} value={p.codigo}>{p.descripcion}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Tipo Comprobante *</label>
                  <select name="voucher_type" value={formData.voucher_type} onChange={handleChange} className={inputClass} required>
                    {parametros.tiposComprobante.map(t => <option key={t.codigo} value={t.codigo}>{t.descripcion}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Concepto *</label>
                  <select name="concept" value={formData.concept} onChange={handleChange} className={inputClass} required>
                    {parametros.tiposConcepto.map(c => <option key={c.codigo} value={c.codigo}>{c.descripcion}</option>)}
                  </select>
                </div>
              </div>

              {/* SECCIÓN 2: DATOS DEL CLIENTE */}
              <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className="text-md font-semibold mb-3">Datos del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Condición IVA *</label>
                    <select name="condicion_iva_receptor_id" value={formData.condicion_iva_receptor_id} onChange={handleChange} className={inputClass} required>
                      {parametros.condicionesIVA.length > 0 
                        ? parametros.condicionesIVA.map(c => <option key={c.codigo} value={c.codigo}>{c.descripcion}</option>)
                        : <option value={1}>IVA Responsable Inscripto</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tipo Documento *</label>
                    <select name="doc_type" value={formData.doc_type} onChange={handleChange} className={inputClass} required>
                      {parametros.tiposDocumento.map(t => <option key={t.codigo} value={t.codigo}>{t.descripcion}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Número Documento *</label>
                    <input type="text" name="doc_number" value={formData.doc_number} onChange={handleChange} className={inputClass} placeholder="Sin guiones" required />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: CALCULADORA DE ÍTEMS */}
              <div className={`p-4 rounded border-2 border-blue-500 ${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}`}>
                <h3 className="text-md font-bold mb-3 text-blue-600">Detalle de Facturación</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>Cantidad *</label>
                    <input type="number" name="cantidad" value={calculadora.cantidad} onChange={handleCalculadoraChange} min="1" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Unidad</label>
                    <input type="text" name="unidad" value={calculadora.unidad} onChange={handleUnitChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Precio Unitario (Neto) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input type="number" name="precioUnitario" value={calculadora.precioUnitario} onChange={handleCalculadoraChange} className={`${inputClass} pl-8`} step="0.01" required />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Alícuota IVA</label>
                    <select name="alicuotaIVA" value={calculadora.alicuotaIVA} onChange={handleCalculadoraChange} className={inputClass}>
                      <option value={21}>21%</option>
                      <option value={10.5}>10.5%</option>
                      <option value={27}>27%</option>
                      <option value={0}>0% (Exento)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: TOTALES (READ ONLY) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                <div className="p-2">
                  <label className="text-xs text-gray-500 uppercase">Neto Gravado</label>
                  <div className="text-xl font-mono">{formData.net_amount.toFixed(2)}</div>
                </div>
                <div className="p-2">
                  <label className="text-xs text-gray-500 uppercase">IVA</label>
                  <div className="text-xl font-mono">{formData.vat_amount.toFixed(2)}</div>
                </div>
                <div className={`p-2 rounded ${darkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                  <label className="text-xs font-bold uppercase text-green-700">Total a Pagar</label>
                  <div className="text-2xl font-bold text-green-700">$ {formData.total_amount.toFixed(2)}</div>
                </div>
              </div>

              {/* SECCIÓN 5: FECHAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 border-gray-200">
                <div>
                  <label className={labelClass}>Inicio Servicio</label>
                  <input type="date" name="service_start_date" value={formData.service_start_date} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fin Servicio</label>
                  <input type="date" name="service_end_date" value={formData.service_end_date} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Vto. Pago</label>
                  <input type="date" name="payment_due_date" value={formData.payment_due_date} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => onClose(false)} className={`px-6 py-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} hover:opacity-80`}>Cancelar</button>
                <button type="submit" disabled={loading} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400">
                  {loading ? 'Procesando...' : 'Emitir Factura'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}