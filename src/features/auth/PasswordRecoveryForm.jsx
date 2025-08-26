import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

function PasswordRecoveryForm({ darkMode }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100">
      <form
        onSubmit={handlePasswordRecovery}
        className="bg-white p-8 rounded-xl shadow-lg min-w-[320px] max-w-sm w-full flex flex-col gap-5"
      >
        <h2 className="text-center mb-2 text-blue-700 text-2xl font-bold">Recuperar contraseña</h2>

        <div className="mb-2">
          <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 text-base bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Ingresa tu correo"
            autoComplete="email"
          />
        </div>
                
        {error && (<div className="text-red-600 text-center font-semibold"> {error} </div>)}
        {message && (<div className="text-green-700 text-center font-semibold"> {message} </div>)}

        <button 
          type="submit" 
          className="w-full p-3 rounded-lg bg-blue-700 text-white font-bold text-base shadow hover:bg-blue-800 transition-colors"
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