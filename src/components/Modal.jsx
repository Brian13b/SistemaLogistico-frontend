import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

function Modal({ isOpen, onClose, title, children }) {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Fondo oscuro */}
      <div className={`fixed inset-0 ${darkMode ? 'bg-gray-900 bg-opacity-50' : 'bg-gray-100 bg-opacity-50'}`} onClick={onClose}></div>

      {/* Contenido del modal */}
      <div
        className={`relative z-10 ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6`}
      >
        {/* Encabezado del modal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            ✕
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

export default Modal;