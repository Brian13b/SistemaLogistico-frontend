import { useTheme } from "../../context/ThemeContext"
import { useReportes } from "../../hooks/useReportes"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function ReportesCharts() {
  const { darkMode } = useTheme();
  const { datos, loading } = useReportes();

  const chartColors = {
    text: darkMode ? "#e5e7eb" : "#6b7280",
    grid: darkMode ? "#374151" : "#f0f0f0",
    tooltip: {
      backgroundColor: darkMode ? "#1f2937" : "white",
      border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
      color: darkMode ? "#e5e7eb" : "#374151",
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="mb-4">
              <div className={`h-6 w-32 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
            <div className={`h-[300px] w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ingresos vs Gastos
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datos.ingresosGastos}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="mes" stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip contentStyle={chartColors.tooltip} />
            <Bar dataKey="ingresos" fill="#3B82F6" name="Ingresos" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" fill="#EF4444" name="Gastos" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Consumo de Combustible
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datos.consumoCombustible}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="dia" stroke={chartColors.text} />
            <YAxis stroke={chartColors.text} />
            <Tooltip contentStyle={chartColors.tooltip} />
            <Line
              type="monotone"
              dataKey="consumo"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              name="Litros"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Estado de Vehículos
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={datos.estadoVehiculos}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="valor"
            >
              {datos.estadoVehiculos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartColors.tooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4">
          {datos.estadoVehiculos.map((item) => (
            <div key={item.nombre} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {item.nombre}: {item.valor}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Rendimiento por Conductor
          </h3>
        </div>
        <div className="space-y-3">
          {datos.rendimientoConductores.map((driver) => (
            <div 
              key={driver.nombre} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${driver.color}`} />
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {driver.nombre}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {driver.viajes} viajes
                </span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {driver.eficiencia}% eficiencia
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
