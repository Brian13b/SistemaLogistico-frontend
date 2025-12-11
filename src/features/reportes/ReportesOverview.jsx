import { TrendingUp, TrendingDown, DollarSign, Fuel, Clock, Users, Truck } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

export function ReportesOverview({ datos, loading }) {
  const { darkMode } = useTheme();

  const getIconComponent = (iconName) => {
    const icons = { DollarSign, Fuel, Clock, Users, Truck, TrendingUp, TrendingDown };
    return icons[iconName] || DollarSign;
  };

  if (loading || !datos.metricas) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} h-32 animate-pulse`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {datos.metricas.map((metric, idx) => {
        const Icon = getIconComponent(metric.icon);
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
        const trendColor = metric.trend === "up" ? "text-green-600" : "text-red-600";

        return (
          <div key={idx} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex justify-between items-center`}>
            <div>
              <h3 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {metric.title}
              </h3>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {metric.value}
              </div>
              <div className="flex items-center text-xs mt-2">
                <TrendIcon className={`h-3 w-3 mr-1 ${trendColor}`} />
                <span className={`${trendColor} font-medium`}>{metric.change}</span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-yellow-50 text-yellow-500' : 'bg-blue-50 text-blue-600'}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        )
      })}
    </div>
  )
}