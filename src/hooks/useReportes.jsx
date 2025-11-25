import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
// Asegúrate de importar tu cliente de API configurado (el que apunta al Gateway)
// Puede ser '../services/api' o donde tengas la instancia de axios.
import api from '../services/api'; 

// Colores para el gráfico de torta
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const useReportes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError } = useNotification();
  
  // Estado inicial con estructura vacía para no romper los componentes
  const [datos, setDatos] = useState({
    metricas: [],
    ingresosGastos: [],
    consumoCombustible: [],
    estadoVehiculos: [], // Aquí mostraremos "Gastos por Categoría"
    rendimientoConductores: [], // Lo dejaremos vacío o simulado si no llegamos a implementarlo
    viajes: []
  });

  const [filtros, setFiltros] = useState({
    periodo: "30days",
    // Calculamos mes y año actual para el default
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear()
  });

  useEffect(() => {
    cargarDatos();
  }, [filtros.mes, filtros.anio]); // Recargar si cambia el mes/año

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Llamada al Backend (Endpoint de Finanzas que creamos ayer)
      // Nota: Asegúrate de que la URL del gateway tenga la ruta /finanzas
      const response = await api.get(`/finanzas/dashboard?mes=${filtros.mes}&anio=${filtros.anio}`);
      const backendData = response.data;

      // 2. Transformación de Datos (Backend -> Frontend UI)

      // A. Tarjetas Superiores (Métricas)
      const metricasTransformadas = [
        {
          title: "Ingresos Totales",
          value: `$ ${backendData.metricas.ingresos_mes.toLocaleString('es-AR')}`,
          icon: "DollarSign",
          change: "Mes Actual",
          trend: "up"
        },
        {
          title: "Gastos Operativos",
          value: `$ ${backendData.metricas.gastos_mes.toLocaleString('es-AR')}`,
          icon: "TrendingDown",
          change: "Mes Actual",
          trend: "down"
        },
        {
          title: "Balance Neto",
          value: `$ ${backendData.metricas.balance.toLocaleString('es-AR')}`,
          icon: "TrendingUp",
          change: "Resultado",
          trend: backendData.metricas.balance >= 0 ? "up" : "down"
        },
        // Si quieres mostrar algo más, puedes agregarlo o dejar 3
        {
            title: "Viajes del Mes",
            value: backendData.viajes_tabla.length.toString(),
            icon: "Truck",
            change: "Registrados",
            trend: "up"
        }
      ];

      // B. Gráfico de Torta (Reutilizamos "estadoVehiculos" para mostrar "Gastos por Tipo")
      const gastosPorTipo = backendData.graficos.gastos_por_tipo.map((item, index) => ({
        nombre: item.nombre, // Ej: "COMBUSTIBLE"
        valor: item.valor,
        color: COLORS[index % COLORS.length]
      }));

      // C. Tabla de Viajes
      const viajesTransformados = backendData.viajes_tabla.map(viaje => ({
        id: viaje.id,
        patente: "Ver Detalle", // El endpoint actual no trae la patente (relación), pero no rompe nada
        conductor: "Ver Detalle",
        origen: viaje.origen,
        destino: viaje.destino,
        fecha: viaje.fecha_salida,
        kilometros: 0, // Dato pendiente
        combustible: 0, // Dato pendiente
        costo: viaje.precio, // Precio del viaje (Ingreso esperado)
        estado: viaje.estado
      }));

      // 3. Actualizar Estado
      setDatos({
        metricas: metricasTransformadas,
        ingresosGastos: backendData.graficos.ingresos_gastos, // Ya viene listo del backend
        consumoCombustible: backendData.graficos.consumo_combustible, // Ya viene listo
        estadoVehiculos: gastosPorTipo, // Mostramos gastos aquí
        rendimientoConductores: [], // Dejamos vacío por ahora para no complicar
        viajes: viajesTransformados
      });

    } catch (err) {
      console.error('Error al cargar reporte:', err);
      setError('No se pudieron cargar los datos financieros.');
      showError('Error al conectar con el servidor de reportes');
      
      // (Opcional) Si falla, podrías dejar los datos vacíos o cargar un fallback
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (nuevosFiltros) => {
    // Aquí podrías lógica para convertir "30days" a mes/anio si quisieras
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const exportarReporte = async (formato) => {
    console.log("Exportar pendiente:", formato);
  };

  return {
    datos,
    filtros,
    loading,
    error,
    aplicarFiltros,
    exportarReporte,
    cargarDatos
  };
};