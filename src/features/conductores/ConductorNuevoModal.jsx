import React, { useState, useEffect } from 'react';
import { conductoresService } from '../../services/ConductoresService'; 
import Modal from '../../components/Modal'; 

function ConductorNuevoModal({ isOpen, onClose, conductorId, darkMode }) {
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
                } catch (err) {
                    console.error("Error al cargar datos:", err);
                    setError("Error al cargar los datos del conductor.");
                } finally {
                    setLoading(false);
                }
            };

            fetchConductorData();
        }
    }, [isOpen, conductorId]);

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
            } else {
                await conductoresService.create(conductor);
            }
            onClose();
        } catch (err) {
            console.error("Error en submit:", err);
            setError("Error al " + (conductorId ? "actualizar" : "crear") + " el conductor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={conductorId ? 'Editar Conductor' : 'Nuevo Conductor'} 
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
                                value={conductor.codigo}
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
                                value={conductor.estado}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>   
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium mb-1">Nombre</label>
                            <input 
                                type="text" 
                                id="nombre" 
                                name="nombre" 
                                value={conductor.nombre}
                                onChange={handleChange}
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="apellido" className="block text-sm font-medium mb-1">Apellido</label>
                            <input 
                                type="text" 
                                id="apellido" 
                                name="apellido" 
                                value={conductor.apellido}
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
                            <label htmlFor="dni" className="block text-sm font-medium mb-1">DNI</label>
                            <input 
                                type="text" 
                                id="dni" 
                                name="dni" 
                                value={conductor.dni}
                                onChange={handleChange}
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="numero_contacto" className="block text-sm font-medium mb-1">Teléfono</label>
                            <input 
                                type="text" 
                                id="numero_contacto" 
                                name="numero_contacto" 
                                value={conductor.numero_contacto}
                                onChange={handleChange}
                                required
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="email_contacto" className="block text-sm font-medium mb-1">Email de Contacto</label>
                        <input
                            type="email"
                            id="email_contacto"
                            name="email_contacto"
                            value={conductor.email_contacto}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="direccion" className="block text-sm font-medium mb-1">Dirección</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={conductor.direccion}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="foto" className="block text-sm font-medium mb-1">Foto</label>
                        <input 
                            type="file"
                            id="foto"
                            name="foto"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            }`}
                        />
                        {imagePreview && (
                            <div className="mt-3">
                                <p className="text-sm mb-1">Vista previa:</p>
                                <img 
                                    src={imagePreview} 
                                    alt="Vista previa" 
                                    className="w-24 h-24 object-cover rounded-full border" 
                                />
                            </div>
                        )}
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
                            {conductorId ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}

export default ConductorNuevoModal;