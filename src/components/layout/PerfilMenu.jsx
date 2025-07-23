import { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PersonalInfoModal from '../../features/auth/PersonalInfoModal';
import UserConfigModal from '../../features/auth/UserConfigModal';
import { userService } from '../../services/UserService';
import { useTheme } from '../../context/ThemeContext';

export default function PerfilMenu({ onLogout, isSidebarCollapsed, user}) {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isPersonalInfoModalOpen, setIsPersonalInfoModalOpen] = useState(false);
  const [isUserConfigModalOpen, setIsUserConfigModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = () => {
    onLogout();
    navigate('/');
    console.log("Cerrando sesión...");
  };
  
  const handlePersonalInfo = () => {
    setIsPersonalInfoModalOpen(true);
    setIsOpen(false);
  };
  
  const handleSettings = () => {
    if (user.role === 'ADMINISTRADOR') {
      setIsUserConfigModalOpen(true);
      setIsOpen(false);
    } else {
      alert('Solo los administradores pueden acceder a esta configuración');
    }
  };
  
  const handleUpdateUser = (updatedUser) => {
    console.log('Actualizando usuario:', updatedUser);
  };

  const handleAddUser = async (newUser) => {
    const register = await userService.registerUser(newUser);
    if (register) {
      alert('Usuario agregado correctamente');
    } else {
      alert('Error al agregar usuario');
    }
    
    console.log('Agregando usuario:', newUser);
  };

  const handleEditUser = async (username, updatedUser) => {
    try {
      const result = await userService.updateUser(username, updatedUser);
      if (result) {
        alert('Usuario actualizado correctamente');
        return true;
      }
    } catch (error) {
      alert('Error al actualizar usuario');
      return false;
    }
  };

  const handleDeleteUser = (user) => {
    console.log('Eliminando usuario:', user);
  };

  return (
    <>
      <div className="relative">
        <button 
          onClick={toggleMenu} 
          className={`flex items-center space-x-3 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded p-2 w-full`}
        >
          <FaUser className={darkMode ? 'text-yellow-400' : 'text-blue-600'} />
          {!isSidebarCollapsed && <span>Perfil</span>}
        </button>
        
        {isOpen && (
          <div className={`absolute bottom-full left-0 w-48 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-900'} border rounded-md shadow-lg`}>
            <ul>
              <li>
                <button 
                  onClick={handlePersonalInfo} 
                  className={`flex items-center w-full px-4 py-2 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FaUser className="mr-2" />
                  <span>Información personal</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={handleSettings} 
                  className={`flex items-center w-full px-4 py-2 text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FaCog className="mr-2" />
                  <span>Configuración</span>
                </button>
              </li>
              <li className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button 
                  onClick={handleLogout} 
                  className={`flex items-center w-full px-4 py-2 text-left text-red-500 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <PersonalInfoModal 
        isOpen={isPersonalInfoModalOpen}
        onClose={() => setIsPersonalInfoModalOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />
  
        {user.role === 'ADMINISTRADOR' && (
          <UserConfigModal 
            isOpen={isUserConfigModalOpen}
            onClose={() => setIsUserConfigModalOpen(false)}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
          
      </>
    );
  }