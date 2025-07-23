import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Lee el valor inicial de localStorage o usa el sistema
  const getInitialTheme = () => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    // Si quieres usar el sistema: return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return false;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    // Aplica la clase solo en <html>
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
};