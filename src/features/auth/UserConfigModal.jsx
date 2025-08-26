import { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { userService } from '../../services/UserService';

const UserConfigModal = ({ isOpen, onClose, onAddUser, onEditUser, onDeleteUser, darkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
      <div
        className={`rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 transition-colors 
          ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-bold flex items-center rounded-full p-2 
              ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
          >
            <FaUserPlus className="mr-2" />
            {isEditing ? 'Editar Usuario' : 'Configuración de Usuarios'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded transition-colors 
              ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaTimes />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className={`mb-4 p-3 rounded 
              ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}
          >
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                  ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                required
                disabled={isEditing}
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                  ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Contraseña
                <span className="ml-2 text-xs text-gray-400">(mínimo 8 caracteres)</span>
                {isEditing && <span className="text-sm text-gray-500 ml-2">(Dejar vacío para no cambiar)</span>}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                  ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
                required={!isEditing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`mt-1 text-xs hover:underline 
                  ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
              >
                {showPassword ? "Ocultar" : "Mostrar"} contraseña
              </button>
            </div>

            {/* Role */}
            <div>
              <label className={`block mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Rol
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                  ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              >
                <option value="CONDUCTOR">Conductor</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-4 flex justify-end space-x-2">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className={`px-4 py-2 rounded flex items-center 
                  ${darkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-500 text-white hover:bg-gray-600'}`}
              >
                <FaTimes className="mr-2" /> Cancelar
              </button>
            )}
            <button
              type="submit"
              className={`w-full py-2 text-white rounded flex items-center justify-center gap-2 transition-colors 
                ${isEditing
                  ? darkMode
                    ? 'bg-blue-700 hover:bg-blue-800'
                    : 'bg-blue-600 hover:bg-blue-700'
                  : darkMode
                    ? 'bg-green-700 hover:bg-green-800'
                    : 'bg-green-600 hover:bg-green-700'}`}
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

        {/* Lista de usuarios */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Usuarios Registrados</h3>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <p>Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No hay usuarios registrados</p>
          ) : (
            <div
              className={`border rounded max-h-64 overflow-y-auto 
                ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}
            >
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex justify-between items-center p-3 border-b transition-colors 
                    ${darkMode
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.username}</p>
                    <div className="flex flex-wrap gap-x-4">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {user.email}
                      </p>
                      <span
                        className={`text-sm px-2 rounded 
                          ${user.role === 'ADMINISTRADOR'
                            ? darkMode
                              ? 'bg-blue-900 text-blue-200'
                              : 'bg-blue-100 text-blue-800'
                            : darkMode
                              ? 'bg-green-900 text-green-200'
                              : 'bg-green-100 text-green-800'}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(user)}
                      className={`p-2 rounded transition-colors 
                        ${darkMode
                          ? 'text-blue-400 hover:bg-blue-900'
                          : 'text-blue-600 hover:bg-blue-100'}`}
                      title="Editar usuario"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={`p-2 rounded transition-colors 
                        ${darkMode
                          ? 'text-red-400 hover:bg-red-900'
                          : 'text-red-600 hover:bg-red-100'}`}
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