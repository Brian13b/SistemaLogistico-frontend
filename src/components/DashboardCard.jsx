import { useTheme } from '../context/ThemeContext';

export default function DashboardCard({ title, value, icon }) {
    const { darkMode } = useTheme();

    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex justify-between items-center`}>
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${darkMode ? 'bg-yellow-200 text-yellow-500' : 'bg-blue-100 text-blue-600'}`}>
          {icon}
        </div>
      </div>
    );
  }