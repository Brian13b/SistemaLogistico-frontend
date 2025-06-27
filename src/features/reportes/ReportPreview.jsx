import { FaPrint } from 'react-icons/fa';

export const ReportPreview = ({
  reportesSeleccionados,
  tiposReportes,
  datosEjemplo,
  darkMode,
  onExportPDF
}) => {
  return (
    <div className={`p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Vista previa del reporte</h2>
        <button
          onClick={onExportPDF}
          className={`px-3 py-1 rounded flex items-center space-x-1 ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <FaPrint size={16} />
          <span>Exportar a PDF</span>
        </button>
      </div>
      
      <div className="space-y-8">
        {Object.entries(reportesSeleccionados).map(([id, seleccionado]) => {
          if (!seleccionado) return null;
          
          const reporte = tiposReportes.find(r => r.id === id);
          const datos = datosEjemplo[id];
          
          if (!datos || datos.length === 0) return null;
          
          return (
            <div key={id} className="border-b pb-6 last:border-b-0">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className={`w-4 h-4 rounded-full bg-${reporte.color}-${darkMode ? '500' : '600'} mr-2`}></span>
                {reporte.nombre}
              </h3>
              
              <div className="overflow-x-auto">
                <table className={`min-w-full border ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <tr>
                      {id === 'viajes' && (
                        <>
                          <th className="py-2 px-4 border-b text-left">ID</th>
                          <th className="py-2 px-4 border-b text-left">Origen</th>
                          <th className="py-2 px-4 border-b text-left">Destino</th>
                          <th className="py-2 px-4 border-b text-left">Fecha</th>
                          <th className="py-2 px-4 border-b text-left">Kilómetros</th>
                        </>
                      )}
                      {id === 'vehiculos' && (
                        <>
                          <th className="py-2 px-4 border-b text-left">ID</th>
                          <th className="py-2 px-4 border-b text-left">Patente</th>
                          <th className="py-2 px-4 border-b text-left">Marca</th>
                          <th className="py-2 px-4 border-b text-left">Modelo</th>
                          <th className="py-2 px-4 border-b text-left">Año</th>
                          <th className="py-2 px-4 border-b text-left">Kilometraje</th>
                        </>
                      )}
                      {id === 'conductores' && (
                        <>
                          <th className="py-2 px-4 border-b text-left">ID</th>
                          <th className="py-2 px-4 border-b text-left">Nombre</th>
                          <th className="py-2 px-4 border-b text-left">Licencia</th>
                          <th className="py-2 px-4 border-b text-left">Vencimiento</th>
                          <th className="py-2 px-4 border-b text-left">Viajes</th>
                        </>
                      )}
                      {id === 'facturacion' && (
                        <>
                          <th className="py-2 px-4 border-b text-left">N° Factura</th>
                          <th className="py-2 px-4 border-b text-left">Cliente</th>
                          <th className="py-2 px-4 border-b text-left">Monto</th>
                          <th className="py-2 px-4 border-b text-left">Fecha</th>
                          <th className="py-2 px-4 border-b text-left">Estado</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map((item, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-750' : 'bg-gray-50')}`}>
                        {/* Renderizado de celdas según el tipo de reporte */}
                        {/* ... (similar al código original) ... */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};