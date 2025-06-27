import React, { useState, useEffect } from 'react';
import { vehiculosService } from '../../services/VehiculosService';
import Modal from '../../components/Modal';

function VehiculoNuevoModal({ isOpen, onClose, vehiculoId, darkMode }) {
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
        if(!isOpen) {
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
            setError(null);
            return;
        }

        if(isOpen && vehiculoId) {
            const fetchVehiculoData = async () => {
                try {
                    setLoading(true);
                    const response = await vehiculosService.getById(vehiculoId);
                    const vehiculoData = response.data;

                    setVehiculo({
                        ...vehiculoData,
                        codigo: vehiculoData.codigo || `VC-${String(vehiculoId).padStart(3, '0')}`
                    });

                    setError(null);
                } catch (error) {
                    console.log('Error al cargar los datos del vehículo', error);
                    setError("Error al cargar los datos del vehículo");
                } finally {
                    setLoading(false);
                }

            };
            fetchVehiculoData();
        }
    }, [isOpen, vehiculoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehiculo({
            ...vehiculo,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (vehiculo.anio === 0 || vehiculo.tara === 0 || vehiculo.carga_maxima === 0 || vehiculo.kilometraje === 0) {
            setError("Por favor, asegúrese de que todos los campos tengan valores válidos.");
            return;
        }

        try {
            setLoading(true);
            if(vehiculoId) {
                await vehiculosService.update(vehiculoId, vehiculo);
            } else {
                await vehiculosService.create(vehiculo);
            }
            setError(null);
            onClose(true);
        } catch (error) {
            console.log('Error al guardar el vehículo', error.response.data);
            setError("Error al " + (vehiculoId ? 'actualizar' : 'guardar') + " el vehículo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={vehiculoId ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            darkMode={darkMode}
        >
            {loading ? (
                <div className="flex justify-center p-4">
                    <p>Cargando...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="codigo" className="block text-sm font-medium mb-1">Código</label>
                            <input 
                                type="text" 
                                id="codigo" 
                                name="codigo" 
                                value={vehiculo.codigo}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        <div>
                            <label htmlFor="marca" className="block text-sm font-medium mb-1">Marca</label>
                            <input 
                                type="text" 
                                id="marca" 
                                name="marca" 
                                value={vehiculo.marca}
                                onChange={handleChange} 
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="modelo" className="block text-sm font-medium mb-1">Modelo</label>
                            <input 
                                type="text" 
                                id="modelo" 
                                name="modelo" 
                                value={vehiculo.modelo}
                                onChange={handleChange} 
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        <div>
                            <label htmlFor="patente" className="block text-sm font-medium mb-1">Patente</label>
                            <input 
                                type="text" 
                                id="patente" 
                                name="patente" 
                                value={vehiculo.patente}
                                onChange={handleChange} 
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="anio" className="block text-sm font-medium mb-1">Año</label>
                            <input 
                                type="number" 
                                id="anio" 
                                name="anio" 
                                value={vehiculo.anio}
                                onChange={handleChange} 
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        <div>
                            <label htmlFor="tipo" className="block text-sm font-medium mb-1">Tipo</label>
                            <select 
                                type="text" 
                                id="tipo" 
                                name="tipo" 
                                value={vehiculo.tipo}
                                onChange={handleChange} 
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            >
                                <option value="CAMION">Camión</option>
                                <option value="CAMIONETA">Furgoneta</option>
                                <option value="AUTO">Auto</option>
                                <option value="MOTO">Moto</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tara" className="block text-sm font-medium mb-1">Tara</label>
                            <input 
                                type="number" 
                                id="tara" 
                                name="tara" 
                                value={vehiculo.tara}
                                onChange={handleChange} 
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        <div>
                            <label htmlFor="carga_maxima" className="block text-sm font-medium mb-1">Carga Máxima</label>
                            <input 
                                type="number" 
                                id="carga_maxima" 
                                name="carga_maxima" 
                                value={vehiculo.carga_maxima}
                                onChange={handleChange} 
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="kilometraje" className="block text-sm font-medium mb-1">Kilometraje</label>
                            <input 
                                type="number" 
                                id="kilometraje" 
                                name="kilometraje" 
                                value={vehiculo.kilometraje}
                                onChange={handleChange}
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        <div>
                            <label htmlFor="estado" className="block text-sm font-medium mb-1">Estado</label>
                            <select
                                id="estado"
                                name="estado"
                                value={vehiculo.estado}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="id_conductor" className="block text-sm font-medium mb-1">Conductor</label>
                            <input
                                type="number"
                                id="id_conductor"
                                name="id_conductor"
                                value={vehiculo.id_conductor}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className={`px-4 py-2 rounded-md ${
                                darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className={`px-4 py-2 rounded-md ${
                                darkMode 
                                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {vehiculoId ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );      
}

export default VehiculoNuevoModal;