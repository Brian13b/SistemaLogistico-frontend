import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { vehiculosService } from '../../services/VehiculosService';
import { conductoresService } from '../../services/ConductoresService'
import { createVehiculo, updateVehiculo } from '../../store/vehiculosSlice';
import Modal from '../../components/Modal';
import { useNotification } from '../../context/NotificationContext';

function VehiculoNuevoModal({ isOpen, onClose, vehiculoId, darkMode }) {
    const dispatch = useDispatch();
    const { showSuccess, showError, showWarning } = useNotification();
    const [conductores, setConductores] = useState([]);
    const [vehiculo, setVehiculo] = useState({
        marca: '', 
        modelo: '',
        patente: '',
        codigo: '',
        estado: '',
        anio: 0,
        tipo: '',
        tara: 0,
        carga_maxima: 0,
        kilometraje: 0,
        id_conductor: 0
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setLoading(true);
                try {
                    const conductoresRes = await conductoresService.getAll();
                    setConductores(conductoresRes.data || []);

                    if (vehiculoId) {
                        const response = await vehiculosService.getById(vehiculoId);
                        const vehiculoData = response.data;

                        setVehiculo({
                            ...vehiculoData,
                            id_conductor: vehiculoData.id_conductor || 0,
                            codigo: vehiculoData.codigo || `VC-${String(vehiculoId).padStart(3, '0')}`
                        });
                    } else {
                        setVehiculo({
                            marca: '', 
                            modelo: '', 
                            patente: '', 
                            codigo: '', 
                            estado: '',
                            anio: 0, 
                            tipo: '', 
                            tara: 0, 
                            carga_maxima: 0, 
                            kilometraje: 0,
                            id_conductor: 0
                        });
                    }
                    setError(null);
                } catch (error) {
                    console.error('Error cargando datos:', error);
                    setError("Error al cargar los datos necesarios.");
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [isOpen, vehiculoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const valorFinal = name === 'id_conductor' ? parseInt(value) : value;
        setVehiculo({
            ...vehiculo,
            [name]: valorFinal
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (vehiculo.anio === 0 || vehiculo.tara === 0 || vehiculo.carga_maxima === 0 || vehiculo.kilometraje === 0) {
            const errorMessage = "Por favor, asegúrese de que todos los campos tengan valores válidos.";
            setError(errorMessage);
            showWarning(errorMessage);
            return;
        }

        try {
            setLoading(true);
            const dataToSend = { ...vehiculo };
            if(vehiculoId) {
                await dispatch(updateVehiculo({ id: vehiculoId, vehiculoData: dataToSend })).unwrap();
                showSuccess("Vehículo actualizado correctamente");
            } else {
                await dispatch(createVehiculo(dataToSend)).unwrap();
                showSuccess("Vehículo creado correctamente");
            }
            setError(null);
            onClose(true);
        } catch (error) {
            console.error('Error submit:', error);
            const msg = error.response?.data?.detail || "Error al guardar el vehículo";
            setError(msg);
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={vehiculoId ? "Editar Vehículo" : "Nuevo Vehículo"} 
            darkMode={darkMode}
        >
            {loading && vehiculoId ? (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="codigo">
                                Código
                            </label>
                            <input
                                id="codigo"
                                name="codigo"
                                type="text"
                                value={vehiculo.codigo}
                                onChange={handleChange}
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="estado">
                                Estado
                            </label>
                            <select
                                id="estado"
                                name="estado"
                                value={vehiculo.estado}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            >
                                <option value="">Seleccionar estado</option>
                                <option value="Activo">Activo</option>
                                <option value="En Mantenimiento">En Mantenimiento</option>
                                <option value="Fuera de Servicio">Fuera de Servicio</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="marca">
                                Marca
                            </label>
                            <input
                                id="marca"
                                name="marca"
                                type="text"
                                value={vehiculo.marca}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="modelo">
                                Modelo
                            </label>
                            <input
                                id="modelo"
                                name="modelo"
                                type="text"
                                value={vehiculo.modelo}
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
                            <label className="block text-sm font-medium mb-1" htmlFor="patente">
                                Patente
                            </label>
                            <input
                                id="patente"
                                name="patente"
                                type="text"
                                value={vehiculo.patente}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="anio">
                                Año
                            </label>
                            <input
                                id="anio"
                                name="anio"
                                type="number"
                                value={vehiculo.anio}
                                onChange={handleChange}
                                required
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-blue-500">Conductor Asignado</label>
                            <select
                                name="id_conductor"
                                value={vehiculo.id_conductor}
                                onChange={handleChange}
                                className={`w-full p-2 rounded border border-blue-300 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}
                            >
                                <option value="0">-- Sin Conductor --</option>
                                {conductores.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre} {c.apellido} (DNI: {c.dni})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Seleccione un conductor para vincularlo a este vehículo.
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="tipo">
                                Tipo
                            </label>
                            <select
                                id="tipo"
                                name="tipo"
                                value={vehiculo.tipo}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            >
                                <option value="">Seleccionar tipo</option>
                                <option value="Camión">Camión</option>
                                <option value="Camioneta">Camioneta</option>
                                <option value="Furgón">Furgón</option>
                                <option value="Remolque">Remolque</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="kilometraje">
                                Kilometraje
                            </label>
                            <input
                                id="kilometraje"
                                name="kilometraje"
                                type="number"
                                value={vehiculo.kilometraje}
                                onChange={handleChange}
                                required
                                min="0"
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="tara">
                                Tara (kg)
                            </label>
                            <input
                                id="tara"
                                name="tara"
                                type="number"
                                value={vehiculo.tara}
                                onChange={handleChange}
                                required
                                min="0"
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="carga_maxima">
                                Carga Máxima (kg)
                            </label>
                            <input
                                id="carga_maxima"
                                name="carga_maxima"
                                type="number"
                                value={vehiculo.carga_maxima}
                                onChange={handleChange}
                                required
                                min="0"
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className={`px-4 py-2 rounded ${
                                darkMode 
                                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                                    : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : darkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                        >
                            {loading ? 'Guardando...' : (vehiculoId ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

export default VehiculoNuevoModal;