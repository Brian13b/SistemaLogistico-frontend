import { useTheme } from '../context/ThemeContext';
import { ReportesFilters } from '../features/reportes/ReportesFilters';
import { ReportesOverview } from '../features/reportes/ReportesOverview';
import { ReportesCharts } from '../features/reportes/ReportesCharts';
import { ReportesTable } from '../features/reportes/ReportesTable';
import { useReportes } from '../hooks/useReportes';

export default function Reportes() {
  const { darkMode } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Reportes y Análisis
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
            Análisis detallado del rendimiento de tu flota
          </p>
        </div>
      </div>

      <ReportesFilters />
      <ReportesOverview />
      <ReportesCharts />
      <ReportesTable />
    </div>
  );
}