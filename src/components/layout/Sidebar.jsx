import { FaHome, FaTruck, FaUser, FaRoute, FaClipboardList, FaMapMarkedAlt, FaFileInvoiceDollar, FaArrowUp } from 'react-icons/fa';
import NavItem from './NavItems';
import PerfilMenu from './PerfilMenu';
import { useTheme } from '../../context/ThemeContext';

function Sidebar({ isSidebarCollapsed, isSidebarOpenMobile, onSidebarCloseMobile, user, onLogout }) {
  const { darkMode } = useTheme();

  const isMobile = window.innerWidth < 768;

  let sidebarClass = `transition-all duration-300 flex flex-col border-r z-40 fixed md:static top-0 left-0 h-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  if (isMobile) {
    sidebarClass += ` w-48 ${isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full'} shadow-lg`;
  } else {
    sidebarClass += ` ${isSidebarCollapsed ? 'w-16' : 'w-48'}`;
  }

  return (
    <div className={sidebarClass} style={{ minWidth: isMobile ? undefined : isSidebarCollapsed ? '4rem' : '8rem' }}>
      <div className="flex flex-col h-full">
        <div className="mt-12 md:mt-0 flex-1">
          <nav className="mt-5 px-2">
            <NavItem icon={<FaHome />} text="Dashboard" path="/logged-in/dashboard" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaTruck />} text="Vehículos" path="/logged-in/vehiculos" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaUser />} text="Conductores" path="/logged-in/conductores" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaRoute />} text="Viajes" path="/logged-in/viajes" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaClipboardList />} text="Reportes" path="/logged-in/reportes" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaMapMarkedAlt />} text="Seguimiento" path="/logged-in/seguimiento" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaFileInvoiceDollar />} text="Facturación" path="/logged-in/facturacion" isCollapsed={isSidebarCollapsed && !isMobile} />
            <NavItem icon={<FaArrowUp />} text="Finanzas" path="/logged-in/finanzas" isCollapsed={isSidebarCollapsed && !isMobile} />
          </nav>
        </div>
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <PerfilMenu 
            onLogout={onLogout}
            isSidebarCollapsed={isSidebarCollapsed && !isMobile}
            user={user}
          />
        </div>
      </div>
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