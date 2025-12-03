import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { finanzasService } from '../../services/finanzasService';
import { vehiculosService } from '../../services/VehiculosService'; 

export default function GastoFormModal({ isOpen, onClose }) {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo_gasto: 'COMBUSTIBLE',
    vehiculo_id: '',
    descripcion: ''
  });

  useEffect(() => {
    if (isOpen) cargarSelects();
  }, [isOpen]);

  const cargarSelects = async () => {
    try {
      const res = await vehiculosService.getAll();
      setVehiculos(res.data || []);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        monto: parseFloat(formData.monto),
        vehiculo_id: formData.vehiculo_id ? parseInt(formData.vehiculo_id) : null
      };

      await finanzasService.crearGasto(dataToSend, archivo);
      
      showSuccess('Gasto registrado correctamente');
      onClose(true); 
    } catch (error) {
      showError('Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nuevo Gasto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Gasto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
            <select 
              value={formData.tipo_gasto}
              onChange={e => setFormData({...formData, tipo_gasto: e.target.value})}
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="COMBUSTIBLE">Combustible</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="PEAJES">Peajes</option>
              <option value="VARIOS">Varios</option>
            </select>
          </div>

          {/* Vehículo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehículo Asociado</label>
            <select 
              value={formData.vehiculo_id}
              onChange={e => setFormData({...formData, vehiculo_id: e.target.value})}
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="">-- General / Ninguno --</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.patente} - {v.modelo}</option>
              ))}
            </select>
          </div>

          {/* Monto y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
              <input 
                type="number" 
                value={formData.monto}
                onChange={e => setFormData({...formData, monto: e.target.value})}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
              <input 
                type="date" 
                value={formData.fecha}
                onChange={e => setFormData({...formData, fecha: e.target.value})}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Detalle / Proveedor</label>
            <input 
              type="text" 
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ej: YPF Ruta 9"
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Comprobante */}
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comprobante (Foto/PDF)
            </label>
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={e => setArchivo(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => onClose(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}