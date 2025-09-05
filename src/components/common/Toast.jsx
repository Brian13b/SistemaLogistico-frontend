import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Toast = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    if (darkMode) {
      switch (type) {
        case 'success':
          return 'bg-green-900 border-green-700';
        case 'error':
          return 'bg-red-900 border-red-700';
        case 'warning':
          return 'bg-yellow-900 border-yellow-700';
        case 'info':
          return 'bg-blue-900 border-blue-700';
        default:
          return 'bg-blue-900 border-blue-700';
      }
    } else {
      switch (type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        case 'info':
          return 'bg-blue-50 border-blue-200';
        default:
          return 'bg-blue-50 border-blue-200';
      }
    }
  };

  const getTextColor = () => {
    if (darkMode) {
      return 'text-gray-200';
    } else {
      switch (type) {
        case 'success':
          return 'text-green-800';
        case 'error':
          return 'text-red-800';
        case 'warning':
          return 'text-yellow-800';
        case 'info':
          return 'text-blue-800';
        default:
          return 'text-blue-800';
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm
        ${getBackgroundColor()}
        ${getTextColor()}
      `}>
        {getIcon()}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className={`
            p-1 rounded-full transition-colors
            ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
          `}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
