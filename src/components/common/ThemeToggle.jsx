import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button 
      onClick={toggleDarkMode} 
      className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
    >
      {darkMode ? 
        <FaSun className="text-yellow-400 text-xl" /> : 
        <FaMoon className="text-gray-600 text-xl" />
      }
    </button>
  );
}

export default ThemeToggle;