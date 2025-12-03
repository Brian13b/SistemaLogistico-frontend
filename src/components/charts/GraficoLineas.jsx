import { useTheme } from '../../context/ThemeContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const GraficoLineas = ({ title, data, className = "" }) => {
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

  const rechartsData = data.labels.map((label, index) => ({
    periodo: label,
    valor: data.datasets[0].data[index],
  }));

  return (
    <div className={className}>
      {title && (
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rechartsData}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis dataKey="periodo" stroke={chartColors.text} />
          <YAxis stroke={chartColors.text} />
          <Tooltip contentStyle={chartColors.tooltip} />
          <Line
            type="monotone"
            dataKey="valor"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
            name={data.datasets[0].label || "Valor"}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
