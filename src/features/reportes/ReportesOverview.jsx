import { TrendingUp, TrendingDown, DollarSign, Fuel, Clock, Users } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import { useReportes } from "../../hooks/useReportes"

export function ReportesOverview() {
  const { darkMode } = useTheme();
  const { datos, loading } = useReportes();

  const getIconComponent = (iconName) => {
    const icons = {
      DollarSign,
      Fuel,
      Clock,
      Users,
    };
    return icons[iconName] || DollarSign;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex justify-between items-center`}>
            <div className="flex flex-col space-y-2">
              <div className={`h-4 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-8 w-20 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
            <div className={`h-12 w-12 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {datos.metricas.map((metric) => {
        const Icon = getIconComponent(metric.icon);
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;

        return (
          <div key={metric.title} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} flex justify-between items-center`}>
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {metric.title}
              </h3>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {metric.value}
              </div>
              <div className="flex items-center text-xs mt-1">
                <TrendIcon 
                  className={`h-3 w-3 mr-1 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`} 
                />
                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {metric.change}
                </span>
                <span className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  vs mes anterior
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-full ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
