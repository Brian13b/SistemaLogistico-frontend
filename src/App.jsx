import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';
import { useTheme } from './context/ThemeContext';

function App() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen">
            <AppRoutes />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;