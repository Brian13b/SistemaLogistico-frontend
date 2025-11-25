import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { finanzasService } from '../../services/finanzasService';
import { viajesService } from '../../services/ViajesService'; 

export default function IngresoFormModal({ isOpen, onClose }) {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [viajes, setViajes] = useState([]);

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo_ingreso: 'VIAJE',
    viaje_id: '',
    cliente_cuit: ''
  });

  useEffect(() => {
    if (isOpen) cargarViajes();
  }, [isOpen]);

  const cargarViajes = async () => {
    try {
      const res = await viajesService.getAll(); 
      setViajes(res.data || []);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        monto: parseFloat(formData.monto),
        viaje_id: formData.viaje_id ? parseInt(formData.viaje_id) : null
      };

      await finanzasService.crearIngreso(dataToSend, archivo);
      showSuccess('Ingreso registrado correctamente');
      onClose(true);
    } catch (error) {
      showError('Error al guardar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-green-600">Nuevo Ingreso</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
            <select 
              value={formData.tipo_ingreso}
              onChange={e => setFormData({...formData, tipo_ingreso: e.target.value})}
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="VIAJE">Cobro de Viaje</option>
              <option value="REINTEGRO">Reintegro</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>

          {formData.tipo_ingreso === 'VIAJE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Viaje Asociado</label>
              <select 
                value={formData.viaje_id}
                onChange={e => setFormData({...formData, viaje_id: e.target.value})}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Seleccionar Viaje --</option>
                {viajes.map(v => (
                  <option key={v.id} value={v.id}>#{v.id} - {v.origen} a {v.destino}</option>
                ))}
              </select>
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <input 
              type="text" 
              value={formData.descripcion}
              onChange={e => setFormData({...formData, descripcion: e.target.value})}
              className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder="Detalle del cobro"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comprobante (Opcional)
            </label>
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={e => setArchivo(e.target.files[0])}
              className="w-full text-sm text-gray-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => onClose(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {loading ? 'Guardando...' : 'Registrar Ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}