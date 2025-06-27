import { useState } from 'react';
import { useReportGenerator } from '../hooks/useReportGenerator';
import { ReportTypeSelector } from '../features/reportes/ReportTypeSelector';
import { DateRangeSelector } from '../features/reportes/DateRangeSelector';
import { ReportSummary } from '../features/reportes/ReportSummary';
import { ReportPreview } from '../features/reportes/ReportPreview';
import { FaPrint, FaDownload, FaBook } from 'react-icons/fa';
import { tiposReportes, datosEjemplo } from '../utils/reportData';

const Reportes = ({ darkMode }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reportesSeleccionados, setReportesSeleccionados] = useState({
    viajes: false,
    vehiculos: false,
    conductores: false,
    facturacion: false
  });
  const [formatoSalida, setFormatoSalida] = useState('pdf');
  
  const { generando, error, reporteGenerado, generarReporte } = useReportGenerator();
  
  const handleGenerate = () => {
    generarReporte({
      fechaInicio,
      fechaFin,
      reportesSeleccionados,
      tiposReportes,
      datosEjemplo,
      formatoSalida
    });
  };
  
  const handleExportPDF = () => {
    const pdf = generarReportePDF(
      reportesSeleccionados,
      tiposReportes,
      datosEjemplo,
      fechaInicio,
      fechaFin
    );
    pdf.save(`Reporte_${new Date(fechaInicio).toLocaleDateString('es-AR')}_${new Date(fechaFin).toLocaleDateString('es-AR')}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <FaBook className="mr-2" />
        Generador de Reportes
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ReportTypeSelector 
          tiposReportes={tiposReportes}
          reportesSeleccionados={reportesSeleccionados}
          onSelect={setReportesSeleccionados}
          darkMode={darkMode}
        />
        
        <DateRangeSelector 
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onStartDateChange={setFechaInicio}
          onEndDateChange={setFechaFin}
          formatoSalida={formatoSalida}
          onFormatChange={setFormatoSalida}
          error={error}
          darkMode={darkMode}
        />
      </div>
      
      <ReportSummary 
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        reportesSeleccionados={reportesSeleccionados}
        tiposReportes={tiposReportes}
        formatoSalida={formatoSalida}
        darkMode={darkMode}
      />
      
      <div className="flex justify-center mb-6">
        <button 
          onClick={handleGenerate}
          disabled={generando}
          className={`px-6 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 ${
            generando 
              ? 'opacity-70 cursor-not-allowed' 
              : 'hover:opacity-90 hover:shadow-lg'
          } ${
            darkMode 
              ? 'bg-yellow-400 text-black' 
              : 'bg-blue-600 text-white'
          }`}
        >
          {generando ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Generando...</span>
            </>
          ) : (
            <>
              {formatoSalida === 'pdf' ? <FaPrint size={18} /> : 
               formatoSalida === 'excel' ? <FaDownload size={18} /> : 
               <FaBook size={18} />}
              <span className="font-medium">
                {formatoSalida === 'pdf' ? 'Generar PDF' : 
                 formatoSalida === 'excel' ? 'Descargar Excel' : 
                 'Ver en Navegador'}
              </span>
            </>
          )}
        </button>
      </div>
      
      {reporteGenerado && formatoSalida === 'web' && (
        <ReportPreview 
          reportesSeleccionados={reportesSeleccionados}
          tiposReportes={tiposReportes}
          datosEjemplo={datosEjemplo}
          darkMode={darkMode}
          onExportPDF={handleExportPDF}
        />
      )}
    </div>
  );
};

export default Reportes;