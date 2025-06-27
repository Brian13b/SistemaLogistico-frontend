import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

function LoginForm({ darkMode }) {
  const [userType, setUserType] = useState('ADMINISTRADOR');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      console.log("Iniciando login...");
      const userData = await login(username, password);
  
      if (!userData) {
        throw new Error("No se pudo obtener la información del usuario.");
      }
  
      const decodedToken = jwtDecode(userData.access_token);
      const role = decodedToken.role.toUpperCase();
  
      if (role === 'ADMINISTRADOR') {
        console.log("Redirigiendo como administrador...");
        navigate('logged-in/dashboard');
      } else if (role === 'CONDUCTOR') {
        console.log("Redirigiendo como conductor...");
        navigate('/logged-in/viajes');
      } else {
        console.error("Rol de usuario no válido:", role);
        throw new Error("Rol de usuario no válido.");
      }
      
    } catch (error) {
      console.error("Error en el login", error);
      setError("Error en el login: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <div className="flex">
          <button 
            type="button"
            className={`flex-1 py-3 px-4 text-center ${
              userType === 'CONDUCTOR' 
                ? `border-b-2 ${darkMode ? 'border-yellow-500 text-yellow-500' : 'border-blue-600 text-blue-600'}` 
                : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`
            }`}
            onClick={() => setUserType('CONDUCTOR')}
          >
            Conductor
          </button>
          <button 
            type="button"
            className={`flex-1 py-3 px-4 text-center ${
              userType === 'ADMINISTRADOR' 
                ? `border-b-2 ${darkMode ? 'border-yellow-500 text-yellow-500' : 'border-blue-600 text-blue-600'}` 
                : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`
            }`}
            onClick={() => setUserType('ADMINISTRADOR')}
          >
            Administrador
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Usuario</label>
        <input 
          type="text" 
          className={`w-full p-3 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contraseña</label>
        <input 
          type="password" 
          className={`w-full p-3 rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="mt-2 text-sm">
          <a href="/recuperar-contrasena" className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Recuperar contraseña</a>
        </div>
      </div>
      {error && <div className={`text-red-500 mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</div>}
      <button 
        type="submit"
        className={`w-full py-3 rounded font-medium ${darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white'}`}
        disabled={loading}
      >
        {loading ? 'Cargando...' : 'Entrar'}
      </button>
    </form>
  );
}

export default LoginForm;