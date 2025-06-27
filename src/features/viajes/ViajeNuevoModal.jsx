import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { viajesService } from '../../services/ViajesService';
import { conductoresService } from '../../services/ConductoresService';
import { vehiculosService } from '../../services/VehiculosService';
import { FaSave, FaTimes } from 'react-icons/fa';

function ViajeNuevoModal({ isOpen, onClose, viajeId, darkMode }) {
  const [viaje, setViaje] = useState({
    codigo: '',
    origen: '',
    destino: '',
    vehiculo_id: '',
    conductor_id: '',
    fecha_salida: '',
    fecha_llegada: '',
    producto: '',
    precio: 0,
    peso: 0,
    unidad_medida: 'Toneladas',
    estado: 'Programado'
  });
  
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        try {
          const [conductoresRes, vehiculosRes] = await Promise.all([
            conductoresService.getAll(),
            vehiculosService.getAll()
          ]);
          
          setConductores(conductoresRes.data);
          setVehiculos(vehiculosRes.data);
        } catch (err) {
          console.error("Error cargando opciones:", err);
        }
      };
      
      fetchOptions();
      
      if (viajeId) {
        setIsEditing(true);
        fetchViaje(viajeId);
      } else {
        setIsEditing(false);
        resetForm();
      }
    }
  }, [isOpen, viajeId]);

  const fetchViaje = async (id) => {
    try {
      setLoading(true);
      const response = await viajesService.getById(id);
      setViaje(response.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos del viaje");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setViaje({
        codigo: '',
        origen: '',
        destino: '',
        vehiculo_id: '',
        conductor_id: '',
        fecha_salida: '',
        fecha_llegada: '',
        producto: '',
        precio: 0,
        peso: 0,
        unidad_medida: 'Toneladas',
        estado: 'Programado'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setViaje(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isEditing) {
        await viajesService.update(viajeId, viaje);
      } else {
        console.log("Guardando viaje:", viaje);
        await viajesService.create(viaje);
      }
      onClose(true);
    } catch (err) {
      console.error("Error al guardar el viaje:", err);
      setError(err.response?.data?.message || "Error al guardar el viaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => onClose(false)} 
      title={isEditing ? "Editar Viaje" : "Nuevo Viaje"} 
      darkMode={darkMode}
    >
      {loading && !isEditing ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          <p className="ml-2">Cargando datos...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`p-3 rounded-md ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="codigo">
              Código
            </label>
            <input
                id="codigo"
                name="codigo"
                type="text"
                value={viaje.codigo}
                onChange={handleChange}
                className={`w-full p-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="origen">
                Origen
              </label>
              <input
                id="origen"
                name="origen"
                type="text"
                value={viaje.origen}
                onChange={handleChange}
                required
                className={`w-full p-2 rounded border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="destino">
                Destino
              </label>
              <input
                id="destino"
                name="destino"
                type="text"
                value={viaje.destino}
                onChange={handleChange}
                required
                className={`w-full p-2 rounded border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="fecha_salida">
                Fecha y Hora de Salida
              </label>
              <input
                id="fecha_salida"
                name="fecha_salida"
                type="date"
                value={viaje.fecha_salida}
                onChange={handleChange}
                required
                className={`w-full p-2 rounded border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="fecha_llegada">
                Fecha y Hora de Llegada (estimada)
              </label>
              <input
                id="fecha_llegada"
                name="fecha_llegada"
                type="date"
                value={viaje.fecha_llegada}
                onChange={handleChange}
                className={`w-full p-2 rounded border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="conductor_id">
                Conductor
              </label>
              <select
                id="conductor_id"
                name="conductor_id"
                value={viaje.conductor_id}
                onChange={handleChange}
                className={`w-full p-2 rounded border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Seleccione un conductor</option>
                {conductores.map(conductor => (
                  <option key={conductor.id} value={conductor.id}>
                    {conductor.nombre} {conductor.apellido} - {conductor.dni}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="vehiculo_id">
                Vehículo
              </label>
              <select
                id="vehiculo_id"
                name="vehiculo_id"
                value={viaje.vehiculo_id}
                onChange={handleChange}
                className={`w-full p-2 rounded border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Seleccione un vehículo</option>
                {vehiculos.map(vehiculo => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.marca} {vehiculo.modelo} - {vehiculo.patente}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="producto">
                Producto
              </label>
              <input
                id="producto"
                name="producto"
                type="text"
                value={viaje.producto}
                onChange={handleChange}
                className={`w-full p-2 rounded border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1" htmlFor="precio">
                    Precio
                </label>
                <input
                    id="precio"
                    name="precio"
                    type="number"
                    value={viaje.precio}
                    onChange={handleChange}
                    className={`w-full p-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1" htmlFor="peso">
                    Peso
                </label>
                <input
                    id="peso"
                    name="peso"
                    type="number"
                    value={viaje.peso}
                    onChange={handleChange}
                    className={`w-full p-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1" htmlFor="unidad_medida">
                    Unidad de Medida
                </label>
                <select
                    id="unidad_medida"
                    name="unidad_medida"
                    value={viaje.unidad_medida}
                    onChange={handleChange}
                    className={`w-full p-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                >
                    <option value="Toneladas">Toneladas</option>
                    <option value="Kilogramos">Kilogramos</option>
                </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="estado">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={viaje.estado}
              onChange={handleChange}
              className={`w-full p-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}
            >
              <option value="Programado">Programado</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          {/*}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="observaciones">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={viaje.observaciones}
              onChange={handleChange}
              rows={3}
              className={`w-full p-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}
            />
          </div>
          */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <FaTimes /> Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                darkMode ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">↻</span> Guardando...
                </>
              ) : (
                <>
                  <FaSave /> {isEditing ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default ViajeNuevoModal;