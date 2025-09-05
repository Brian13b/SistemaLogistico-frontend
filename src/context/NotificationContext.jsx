import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/common/Toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
    duration: 3000
  });

  const showNotification = (message, type = 'success', duration = 3000) => {
    setNotification({
      show: true,
      message,
      type,
      duration
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      show: false
    }));
  };

  const showSuccess = (message, duration = 3000) => {
    showNotification(message, 'success', duration);
  };

  const showError = (message, duration = 4000) => {
    showNotification(message, 'error', duration);
  };

  const showWarning = (message, duration = 4000) => {
    showNotification(message, 'warning', duration);
  };

  const showInfo = (message, duration = 3000) => {
    showNotification(message, 'info', duration);
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      hideNotification
    }}>
      {children}
      <Toast
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};
