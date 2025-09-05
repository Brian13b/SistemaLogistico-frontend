import React, { useState, useEffect } from 'react';
import { conductoresService } from '../../services/ConductoresService'; 
import Modal from '../../components/Modal'; 
import { useNotification } from '../../context/NotificationContext';

function ConductorNuevoModal({ isOpen, onClose, conductorId, darkMode }) {
    const { showSuccess, showError, showWarning } = useNotification();
    const [conductor, setConductorData] = useState({
        codigo: '',
        nombre: '',
        apellido: '',
        dni: '',
        foto: '',
        numero_contacto: '',
        email_contacto: '',
        direccion: '',
        estado: 'Activo'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setConductorData({
                codigo: '',
                nombre: '',
                apellido: '',
                dni: '',
                foto: '',
                numero_contacto: '',
                email_contacto: '',
                direccion: '',
                estado: 'Activo',
            });
            setImagePreview(null);
            setError(null);
            return;
        }
        
        if (isOpen && conductorId) {
            const fetchConductorData = async () => {
                try {
                    setLoading(true);
                    const response = await conductoresService.getById(conductorId);
                    const conductorData = response.data;
                    
                    setConductorData({
                        ...conductorData,
                        codigo: conductorData.codigo || `C-${String(conductorId).padStart(3, '0')}`
                    });
                    
                    setImagePreview(conductorData.foto || null);
                    setError(null);
                    showSuccess("Datos del conductor cargados correctamente");
                } catch (err) {
                    console.error("Error al cargar datos:", err);
                    setError("Error al cargar los datos del conductor.");
                    showError("Error al cargar los datos del conductor");
                } finally {
                    setLoading(false);
                }
            };

            fetchConductorData();
        }
    }, [isOpen, conductorId, showSuccess, showError]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConductorData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConductorData(prevData => ({
                    ...prevData,
                    foto: reader.result,
                }));
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (conductorId) {
                await conductoresService.update(conductorId, conductor);
                showSuccess("Conductor actualizado correctamente");
            } else {
                await conductoresService.create(conductor);
                showSuccess("Conductor creado correctamente");
            }
            onClose();
        } catch (err) {
            console.error("Error en submit:", err);
            const errorMessage = err.response?.data?.message || "Error al guardar el conductor";
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => onClose()} 
            title={conductorId ? "Editar Conductor" : "Nuevo Conductor"} 
            darkMode={darkMode}
        >
            {loading && conductorId ? (
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
                                value={conductor.codigo}
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
                                value={conductor.estado}
                                onChange={handleChange}
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                                <option value="Suspendido">Suspendido</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="nombre">
                                Nombre
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                value={conductor.nombre}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="apellido">
                                Apellido
                            </label>
                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                value={conductor.apellido}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="dni">
                            DNI
                        </label>
                        <input
                            id="dni"
                            name="dni"
                            type="text"
                            value={conductor.dni}
                            onChange={handleChange}
                            required
                            className={`w-full p-2 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="numero_contacto">
                                Número de Contacto
                            </label>
                            <input
                                id="numero_contacto"
                                name="numero_contacto"
                                type="tel"
                                value={conductor.numero_contacto}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="email_contacto">
                                Email de Contacto
                            </label>
                            <input
                                id="email_contacto"
                                name="email_contacto"
                                type="email"
                                value={conductor.email_contacto}
                                onChange={handleChange}
                                required
                                className={`w-full p-2 rounded border ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="direccion">
                            Dirección
                        </label>
                        <input
                            id="direccion"
                            name="direccion"
                            type="text"
                            value={conductor.direccion}
                            onChange={handleChange}
                            required
                            className={`w-full p-2 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="foto">
                            Foto
                        </label>
                        <input
                            id="foto"
                            name="foto"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={`w-full p-2 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                        {imagePreview && (
                            <div className="mt-2">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-20 h-20 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={() => onClose()}
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
                            {loading ? 'Guardando...' : (conductorId ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

export default ConductorNuevoModal;