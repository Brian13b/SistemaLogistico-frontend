import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ThemeToggle from '../../components/common/ThemeToggle';
import LoginForm from '../../features/auth/LoginForm';
import { useTheme } from '../../context/ThemeContext';

function LoginPage() {
  const { darkMode, toggleDarkMode } = useTheme();

  // DESPERTADOR DE SERVIDORES
  useEffect(() => {
    const despertarServidores = async () => {
      try {
        console.log("⏰ Intentando despertar al Gateway y Backends...");
        //await api.get('/health'); 
        await fetch('https://logistico-gateway.onrender.com/docs'); 
        await fetch('https://logistico-backend.onrender.com/docs'); 
      } catch (error) {
        console.log("El servidor se está despertando...", error);
      }
    };

    despertarServidores();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Background image */}
      <div className="hidden lg:block lg:w-2/3 relative">
        <img 
          src="https://picsum.photos/id/2/1200/800"
          alt="Logistica" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-blue-700/80">
          <div className="p-12 text-white">
            <div className="flex items-center mb-16">
              <div className="text-3xl font-bold flex items-center">
                <span className="bg-yellow-500 text-gray-900 rounded-full p-2 mr-2">B</span>
                LOGISTICA
              </div>
            </div>
            <div className="mt-32">
              <h1 className="text-5xl font-bold leading-tight">
                Simplificando la logística,<br />conectando personas
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Login form */}
      <div className={`w-full lg:w-1/3 flex flex-col justify-center p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="mb-10 lg:hidden">
          <div className="text-2xl font-bold flex items-center">
            <span className={`${darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white'} rounded-full p-2 mr-2`}>B</span>
            LOGISTICA
          </div>
        </div>

        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Elegí tu tipo de usuario
          </h2>
          <div className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-400'} mb-4`}></div>
        </div>

        <LoginForm darkMode={darkMode} />
      </div>
    </div>
  );
}

export default LoginPage;