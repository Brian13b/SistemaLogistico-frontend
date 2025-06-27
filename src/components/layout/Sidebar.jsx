import { FaDashcube, FaTruck, FaUser, FaRoute, FaClipboardList, FaMapMarkedAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import NavItem from './NavItems';
import PerfilMenu from './PerfilMenu';

function Sidebar({ darkMode, isSidebarCollapsed, handleLogout, user }) {
  return (
    <div
      className={`hidden md:flex flex-col transition-all duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="overflow-y-auto flex-grow">
        <nav className="mt-5 px-2">
          <NavItem icon={<FaDashcube />} text="Dashboard" path="/logged-in/dashboard" darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<FaTruck />} text="Vehículos" path="/logged-in/vehiculos" darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<FaUser />} text="Conductores" path="/logged-in/conductores" darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<FaRoute />} text="Viajes" path="/logged-in/viajes" darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<FaClipboardList />} text="Reportes" path="/logged-in/reportes" darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<FaMapMarkedAlt />} text="Seguimiento" path="/logged-in/seguimiento" darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
          <NavItem icon={<FaFileInvoiceDollar />} text="Facturación" path="/logged-in/facturacion" darkMode={darkMode} isCollapsed={isSidebarCollapsed} />
        </nav>
      </div>

      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <PerfilMenu 
          darkMode={darkMode} 
          onLogout={handleLogout}
          isSidebarCollapsed={isSidebarCollapsed}
          user={user}
        />
      </div>
    </div>
  );
}

export default Sidebar;