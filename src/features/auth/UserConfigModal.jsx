import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { userService } from '../../services/UserService';

const UserConfigModal = ({ isOpen, onClose, onAddUser, onEditUser, onDeleteUser }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'CONDUCTOR'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingUsername, setCurrentEditingUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      resetForm();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userList = await userService.listUsers();
      setUsers(userList);
    } catch (error) {
      setError('Error al cargar usuarios');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '', 
      role: user.role
    });
    setCurrentEditingUsername(user.username);
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isEditing) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await onEditUser(currentEditingUsername, updateData);
      } else {
        if (!formData.password) {
          throw new Error('La contraseña es requerida');
        }
        await onAddUser(formData);
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      setError(error.message || `Error al ${isEditing ? 'actualizar' : 'agregar'} usuario`);
      console.error('Submission error:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await onDeleteUser(userId);
        fetchUsers();
      } catch (error) {
        setError('Error al eliminar usuario');
        console.error('Delete error:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'CONDUCTOR'
    });
    setCurrentEditingUsername(null);
    setIsEditing(false);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaUserPlus className="mr-2" />
            {isEditing ? 'Editar Usuario' : 'Configuración de Usuarios'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Nombre de Usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
                required
                disabled={isEditing} 
              />
            </div>
            <div>
              <label className="block mb-2">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
                required
              />
            </div>
            <div>
              <label className="block mb-2">
                Contraseña
                {isEditing && <span className="text-sm text-gray-500 ml-2">(Dejar vacío para no cambiar)</span>}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
                required={!isEditing}
              />
            </div>
            <div>
              <label className="block mb-2">Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 border rounded dark:bg-gray-700"
              >
                <option value="CONDUCTOR">Conductor</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded flex items-center"
              >
                <FaTimes className="mr-2" /> Cancelar
              </button>
            )}
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded flex items-center ${
                isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isEditing ? (
                <>
                  <FaSave className="mr-2" /> Guardar Cambios
                </>
              ) : (
                <>
                  <FaUserPlus className="mr-2" /> Agregar Usuario
                </>
              )}
            </button>
          </div>
        </form>

        {/* Lista de Usuarios */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Usuarios Registrados</h3>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <p>Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No hay usuarios registrados</p>
          ) : (
            <div className="border rounded dark:border-gray-700 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.username}</p>
                    <div className="flex flex-wrap gap-x-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                      <span className={`text-sm px-2 rounded ${
                        user.role === 'ADMINISTRADOR' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                      title="Editar usuario"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      title="Eliminar usuario"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserConfigModal;