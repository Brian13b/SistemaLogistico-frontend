import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimes } from 'react-icons/fa';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  darkMode,
  type = 'warning', // 'warning', 'info', 'success', 'danger'
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <FaInfoCircle className="h-6 w-6 text-blue-500" />;
      case 'success':
        return <FaCheckCircle className="h-6 w-6 text-green-500" />;
      case 'danger':
        return <FaExclamationTriangle className="h-6 w-6 text-red-500" />;
      default:
        return <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    const baseClass = "px-4 py-2 rounded text-white font-medium transition-colors";
    switch (type) {
      case 'warning':
        return `${baseClass} ${darkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'}`;
      case 'info':
        return `${baseClass} ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`;
      case 'success':
        return `${baseClass} ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}`;
      case 'danger':
        return `${baseClass} ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}`;
      default:
        return `${baseClass} ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`rounded-lg shadow-xl w-full max-w-md mx-4 ${
        darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <h2 className={`text-lg font-semibold ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {title}
              </h2>
            </div>
            {showCloseButton && (
              <button
                onClick={onCancel}
                className={`p-1 rounded-lg hover:bg-gray-100 ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <FaTimes className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className={`text-sm leading-relaxed ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-600 hover:bg-gray-700 text-gray-200' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`${getConfirmButtonClass()} ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
