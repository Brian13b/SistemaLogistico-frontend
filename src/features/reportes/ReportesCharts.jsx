import { useTheme } from "../../context/ThemeContext"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts"

export function ReportesCharts({ datos, loading }) {
  const { darkMode } = useTheme();

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
    return <div className="h-64 w-full flex items-center justify-center">Cargando gráficos...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gráfico de Barras: Ingresos vs Gastos */}
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
            <Legend />
            <Bar dataKey="ingresos" fill="#3B82F6" name="Ingresos" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" fill="#EF4444" name="Gastos" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Torta: Distribución de Gastos*/}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Distribución de Gastos
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
              nameKey="nombre"
            >
              {datos.estadoVehiculos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartColors.tooltip} formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Líneas: Consumo Combustible */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} lg:col-span-2`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Consumo de Combustible (Mes Actual)
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datos.consumoCombustible}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="dia" stroke={chartColors.text} label={{ value: 'Día', position: 'insideBottom', offset: -5 }} />
            <YAxis stroke={chartColors.text} />
            <Tooltip contentStyle={chartColors.tooltip} formatter={(value) => `$${value.toLocaleString()}`} />
            <Line
              type="monotone"
              dataKey="consumo"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              name="Gasto Diario"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}