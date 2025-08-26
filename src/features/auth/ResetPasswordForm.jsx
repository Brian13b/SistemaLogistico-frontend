
import { useState } from 'react';
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
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100`}>
            <div className={`bg-white ${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg min-w-[320px] max-w-sm w-full flex flex-col gap-5`}>
                <h2 className={`text-center mb-2 text-blue-700 text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-blue-700'}`}>
                    Restablecer Contraseña
                </h2>
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <div>
                        <label className={`block mb-2 font-semibold text-gray-700 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nueva Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`w-full p-3 rounded-lg border border-gray-300 text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}`}
                            placeholder="Ingresa la nueva contraseña"
                        />
                    </div>
                    <div>
                        <label className={`block mb-2 font-semibold text-gray-700 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirmar Contraseña</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={`w-full p-3 rounded-lg border border-gray-300 text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}`}
                            placeholder="Confirma la nueva contraseña"
                        />
                    </div>
                    {message && (
                        <div className={`mb-2 p-3 rounded text-center font-semibold ${message.includes('error') ? (darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-100') : (darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-100')}`}>
                            {message}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-3 rounded-lg bg-blue-700 text-white font-bold text-base shadow hover:bg-blue-800 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Cargando...' : 'Restablecer Contraseña'}
                    </button>
                    <div className="mt-2 text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                            Volver al Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordForm;