import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/AuthService';

function PasswordRecoveryForm({ darkMode }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authService.requestPasswordReset(email);
      
      setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setMessage(
        error.response?.data?.message || 
        'Ocurrió un error al enviar el enlace de recuperación.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded shadow-md`}>
      <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        Recuperar Contraseña
      </h2>
      
      <form onSubmit={handlePasswordRecovery}>
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Correo Electrónico
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`w-full p-3 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
            placeholder="Ingresa tu correo electrónico"
          />
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.includes('error') ? (darkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-100') : (darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-100')}`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          className={`w-full py-3 rounded font-medium ${darkMode ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600' : 'bg-blue-600 text-white hover:bg-blue-700'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Recuperar Contraseña'}
        </button>

        <div className="mt-4 text-center">
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
  );
}

export default PasswordRecoveryForm;