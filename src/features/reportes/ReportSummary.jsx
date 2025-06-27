export const ReportSummary = ({
    fechaInicio,
    fechaFin,
    reportesSeleccionados,
    tiposReportes,
    formatoSalida,
    darkMode
  }) => {
    const formatearFechaAR = (fechaISO) => {
      if (!fechaISO) return '';
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-AR');
    };
  
    return (
      <div className={`p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-6`}>
        <h2 className="text-lg font-semibold mb-4">Resumen de Selección</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Periodo:</span>{' '}
            {fechaInicio && fechaFin 
              ? `Del ${formatearFechaAR(fechaInicio)} al ${formatearFechaAR(fechaFin)}` 
              : 'Ningún periodo seleccionado'}
          </p>
          <p className="font-medium">Reportes seleccionados:</p>
          <ul className="list-disc pl-5">
            {Object.entries(reportesSeleccionados)
              .filter(([_, seleccionado]) => seleccionado)
              .map(([id, _]) => {
                const reporte = tiposReportes.find(r => r.id === id);
                return (
                  <li key={id} className="ml-2">
                    {reporte.nombre}
                  </li>
                );
              })}
            {!Object.values(reportesSeleccionados).some(v => v) && (
              <li className="text-gray-500 italic ml-2">Ningún reporte seleccionado</li>
            )}
          </ul>
          <p>
            <span className="font-medium">Formato:</span> {formatoSalida.toUpperCase()}
          </p>
        </div>
      </div>
    );
  };