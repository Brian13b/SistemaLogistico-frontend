import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function NavItem({ icon, text, path, isCollapsed }) {
  const { darkMode } = useTheme();

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center space-x-2 px-3 py-2 rounded mb-2 transition-colors ${
          isActive
            ? darkMode
              ? 'bg-yellow-500 text-gray-900 font-medium'
              : 'bg-blue-600 text-white font-medium'
            : darkMode
            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        } ${isCollapsed ? 'justify-center' : ''}`
      }
    >
      {({ isActive}) => (
        <>
          <span className={`text-lg ${ darkMode ? isActive ? 'text-grey-900' : 'text-gray-300' : isActive ? 'text-grey-300' : 'text-gray-900'}`}>
            {icon}
          </span>
          {!isCollapsed && (
            <span className={`text-base ${darkMode ? isActive ? 'text-grey-900' : 'text-gray-300' : isActive ? 'text-gray-100' : 'text-gray-900'}`}>
              {text}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}