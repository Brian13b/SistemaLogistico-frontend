import { useState } from 'react';
import { generateFichaPDF } from '../utils/pdfGenerator';

export const useReportGenerator = () => {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [reporteGenerado, setReporteGenerado] = useState(false);
  
  const generarReporte = async (config) => {
    try {
      setGenerando(true);
      setError('');
      setReporteGenerado(false);
      
      // Validaciones
      if (!config.fechaInicio || !config.fechaFin) {
        throw new Error('Por favor, selecciona ambas fechas');
      }
      
      if (!Object.values(config.reportesSeleccionados).some(v => v)) {
        throw new Error('Por favor, selecciona al menos un tipo de reporte');
      }
      
      const inicio = new Date(config.fechaInicio);
      const fin = new Date(config.fechaFin);
      if (fin < inicio) {
        throw new Error('La fecha final debe ser posterior a la fecha inicial');
      }
      
      // Simular generación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (config.formatoSalida === 'pdf') {
        const pdf = generarReportePDF(
          config.reportesSeleccionados,
          config.tiposReportes,
          config.datosEjemplo,
          config.fechaInicio,
          config.fechaFin
        );
        pdf.save(`Reporte_${new Date(config.fechaInicio).toLocaleDateString('es-AR')}_${new Date(config.fechaFin).toLocaleDateString('es-AR')}.pdf`);
      }
      
      setReporteGenerado(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setGenerando(false);
    }
  };
  
  return { generando, error, reporteGenerado, generarReporte };
};