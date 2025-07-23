import { FaDashcube, FaTruck, FaUser, FaRoute, FaClipboardList, FaMapMarkedAlt, FaFileInvoiceDollar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import NavItem from './NavItems';
import PerfilMenu from './PerfilMenu';
import { useTheme } from '../../context/ThemeContext';

function Sidebar({ isSidebarCollapsed, isSidebarOpenMobile, onSidebarCloseMobile, handleSidebarToggle, user }) {
  const { darkMode } = useTheme();

  // Detectar si es mobile
  const isMobile = window.innerWidth < 768;

  // Clases base para sidebar
  let sidebarClass = `transition-all duration-300 flex flex-col border-r z-40 fixed md:static top-0 left-0 h-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  if (isMobile) {
    sidebarClass += ` w-64 ${isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full'} shadow-lg`;
  } else {
    sidebarClass += ` ${isSidebarCollapsed ? 'w-16' : 'w-64'}`;
  }

  return (
    <div className={sidebarClass} style={{ minWidth: isMobile ? undefined : isSidebarCollapsed ? '4rem' : '16rem' }}>
      {/* Botón para colapsar/expandir en desktop */}
      {/* Eliminado el botón de flecha, solo se controla desde el header */}
      <div className="flex flex-col h-full">
        <div className="mt-12 md:mt-0 flex-1">
          <nav className="mt-5 px-2">
            <NavItem icon={<FaDashcube />} text="Dashboard" path="/logged-in/dashboard" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaTruck />} text="Vehículos" path="/logged-in/vehiculos" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaUser />} text="Conductores" path="/logged-in/conductores" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaRoute />} text="Viajes" path="/logged-in/viajes" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaClipboardList />} text="Reportes" path="/logged-in/reportes" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaMapMarkedAlt />} text="Seguimiento" path="/logged-in/seguimiento" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaFileInvoiceDollar />} text="Facturación" path="/logged-in/facturacion" isCollapsed={isSidebarCollapsed && !isMobile} />
          </nav>
        </div>
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <PerfilMenu 
            onLogout={onSidebarCloseMobile}
            isSidebarCollapsed={isSidebarCollapsed && !isMobile}
            user={user}
          />
        </div>
      </div>
      {/* Cerrar drawer en mobile */}
      {isMobile && isSidebarOpenMobile && (
        <button
          onClick={onSidebarCloseMobile}
          className={`absolute top-4 right-4 z-50 p-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} shadow`}
        >
          X
        </button>
      )}
    </div>
  );
}

export default Sidebar;