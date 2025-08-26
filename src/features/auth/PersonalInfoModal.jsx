import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaKey, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { userService } from '../../services/UserService';

const PersonalInfoModal = ({ isOpen, onClose, user, onUpdateUser, darkMode }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!isOpen || !user?.username) return;
            
            setIsLoadingUser(true);
            try {
                const userData = await userService.getUser(user.username); 
                setFormData({
                    username: userData.username || '',
                    email: userData.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } catch (error) {
                console.error('Error al obtener los datos del usuario:', error);
                setErrors({ general: 'No se pudieron cargar los datos del usuario' });
            } finally {
                setIsLoadingUser(false);
            }
        };
        
        fetchUser();
    }, [isOpen, user?.username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
        
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Ingrese un correo electrónico válido';
        }
        
        if (formData.newPassword) {
            if (!formData.currentPassword) newErrors.currentPassword = 'Debe ingresar la contraseña actual para cambiarla';
            if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
            if (formData.newPassword.length < 8) newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const updateData = {
                username: formData.username,
                email: formData.email,
                ...(formData.newPassword && { 
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword 
                })
            };

            await onUpdateUser(updateData);
            onClose();
        } catch (error) {
            if (error.response?.data?.detail === "Contraseña actual incorrecta") {
                setErrors({ currentPassword: 'Contraseña actual incorrecta' });
            } else {
                setErrors({ general: error.message || 'Error al actualizar la información' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div
                className={`rounded-lg shadow-lg w-full max-w-md p-6 transition-colors animate-fadeIn ${
                    darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
                }`}
            >
                <h2 className="text-xl font-bold mb-4 flex items-center"> Información Personal</h2>
                <p className="text-sm text-gray-500 mb-4">Actualiza tu información personal y contraseña</p>
                
                {(errors.general || Object.values(errors).some(error => error)) && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-start">
                        <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0" />
                        <div>
                            {errors.general && <p className="font-medium">{errors.general}</p>}
                            {Object.entries(errors).map(([key, error]) => (
                                key !== 'general' && error && <p key={key}>{error}</p>
                            ))}
                        </div>
                    </div>
                )}
                
                {isLoadingUser ? (
                    <div className="flex justify-center py-8">
                        <FaSpinner className="animate-spin text-2xl text-blue-500" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <div className="flex items-center mb-2">
                                <FaUser className="mr-2" /> Usuario 
                                <span className={`text-sm px-2 rounded ml-2 ${
                                    user?.role === 'ADMINISTRADOR'
                                        ? (darkMode
                                            ? 'bg-blue-900 text-blue-200'
                                            : 'bg-blue-100 text-blue-800')
                                        : (darkMode
                                            ? 'bg-green-900 text-green-200'
                                            : 'bg-green-100 text-green-800')
                                }`}>
                                    {user?.role}
                                </span>
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                                }`}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block mb-2 flex items-center">
                                <FaEnvelope className="mr-2" /> Correo Electrónico
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                                }`}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block mb-2 flex items-center">
                                <FaKey className="mr-2" /> Contraseña Actual
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                                }`}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className={`mt-1 text-xs hover:underline ${
                                    darkMode ? "text-blue-400" : "text-blue-600"
                                }`}
                            >
                                {showPassword ? "Ocultar" : "Mostrar"} contraseña
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block mb-2 flex items-center">
                                <FaKey className="mr-2" /> Nueva Contraseña
                            </label>
                            <input 
                                type="password" 
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded placeholder-gray-400 ${
                                    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                                } ${errors.newPassword ? 'border-red-500' : ''}`}
                                placeholder="Mínimo 8 caracteres"
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block mb-2 flex items-center">
                                <FaKey className="mr-2" /> Confirmar Nueva Contraseña
                            </label>
                            <input 
                                type="password" 
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full p-2 border rounded placeholder-gray-400 ${
                                    darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                                } ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                placeholder="Repita la nueva contraseña"
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className={`px-4 py-2 rounded transition ${
                                    darkMode
                                        ? "bg-gray-600 hover:bg-gray-500"
                                        : "bg-gray-200 hover:bg-gray-300"
                                }`}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PersonalInfoModal;