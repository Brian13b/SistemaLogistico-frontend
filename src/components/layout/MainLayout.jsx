import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useIsMobile } from '../../hooks/useIsMobile';

function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const isMobile = useIsMobile();

  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsSidebarOpenMobile(!isSidebarOpenMobile);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleSidebarCloseMobile = () => {
    setIsSidebarOpenMobile(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <header className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex items-center justify-between p-4`}>
        <button
          onClick={handleSidebarToggle}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors mr-4`}
        >
          <FaBars className={`${darkMode ? 'text-yellow-400' : 'text-gray-600'}`} />
        </button>
        {/* Logo y título */}
        <div className="flex items-center">
          <div className="pr-5">
            <div className={`text-xl font-bold flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              <span className={`${darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-blue-600 text-white'} rounded-full p-2 mr-2`}>B</span>
              LOGISTICA
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </header>
      {/* Contenedor principal (sidebar + contenido) */}
      <div className={`flex flex-1 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          isSidebarOpenMobile={isSidebarOpenMobile}
          onSidebarCloseMobile={handleSidebarCloseMobile}
          handleSidebarToggle={handleSidebarToggle}
          user={user}
          onLogout={handleLogout}
        />
        {isSidebarOpenMobile && isMobile && (
          <div
            className="fixed inset-0 bg-transparent bg-opacity-40 z-30"
            onClick={handleSidebarCloseMobile}
          ></div>
        )}
        <main className={`flex-1 overflow-auto ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-6 ${isSidebarCollapsed && !isMobile ? 'ml-3' : 'ml-3'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;