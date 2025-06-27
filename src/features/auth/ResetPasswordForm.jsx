import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

function ResetPasswordForm({ darkMode }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
        navigate('/');
    }

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (password !== confirmPassword) {
        setMessage('Las contraseñas no coinciden.');
        setLoading(false);
        return;
        }

        try {
        await authService.resetPassword(email, token, password, confirmPassword);
        setMessage('Contraseña restablecida con éxito.');
        setTimeout(() => {
            navigate('/login');
        }, 3000);
        } catch (error) {
        setMessage(
            error.response?.data?.message ||
            'Ocurrió un error al restablecer la contraseña.'
        );
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className={`max-w-md mx-auto p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Restablecer Contraseña
        </h2>

        <form onSubmit={handleResetPassword}>
            <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nueva Contraseña
            </label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full p-3 rounded ${
                    darkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
            />
            </div>
            <div className="mb-4"> 
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirmar Contraseña
                </label>
            </div>
            <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`w-full p-3 rounded ${
                darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
            />
            <div className="text-center mt-4">
                {message && (
                    <div className={`
                    mb-4 p-3 rounded 
                    ${message.includes('error')
                        ? (darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-100')
                        : (darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-100')
                    }
                    `}>
                    {message}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className={`
                    w-full p-3 rounded bg-blue-500 text-white font-medium
                    ${loading ? 'opacity-50' : 'hover:bg-blue-600'}
                    `}
                >
                    {loading ? 'Cargando...' : 'Restablecer Contraseña'}
                </button>
            </div>
        </form>
        </div>
    );
}

export default ResetPasswordForm;