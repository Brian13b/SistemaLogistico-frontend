import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api'; 
import { vehiculosService } from '../services/VehiculosService';
import { conductoresService } from '../services/ConductoresService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const useReportes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError } = useNotification();
  
  const [datos, setDatos] = useState({
    metricas: [],
    ingresosGastos: [],
    consumoCombustible: [],
    estadoVehiculos: [], 
    rendimientoConductores: [], 
    viajes: [],
    vehiculos: [], 
    conductores: []
  });

  const [filtros, setFiltros] = useState({
    periodo: "30days",
    vehiculo: "all-vehicles",
    conductor: "all-drivers",
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear()
  });

  useEffect(() => {
    cargarDatos();
  }, [filtros.mes, filtros.anio]); 

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Llamada al Backend (Dashboard + Listas para filtros)
      const [dashboardRes, vehiculosRes, conductoresRes] = await Promise.all([
          api.get(`/finanzas/dashboard?mes=${filtros.mes}&anio=${filtros.anio}`),
          vehiculosService.getAll(),
          conductoresService.getAll()
      ]);

      const backendData = dashboardRes.data;

      // 2. Transformación de Datos del Dashboard

      // A. Métricas
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
        {
            title: "Viajes del Mes",
            value: backendData.viajes_tabla.length.toString(),
            icon: "Users",
            change: "Registrados",
            trend: "up"
        }
      ];

      // B. Gráfico Torta
      const gastosPorTipo = backendData.graficos.gastos_por_tipo.map((item, index) => ({
        nombre: item.nombre,
        valor: item.valor,
        color: COLORS[index % COLORS.length]
      }));

      // C. Tabla de Viajes
      const viajesTransformados = backendData.viajes_tabla.map(viaje => ({
        id: viaje.id,
        patente: "Ver Detalle", 
        conductor: "Ver Detalle",
        origen: viaje.origen,
        destino: viaje.destino,
        fecha: viaje.fecha_salida,
        kilometros: 0,
        combustible: 0,
        costo: viaje.precio,
        estado: viaje.estado
      }));

      // 3. Transformación de Listas para Filtros (Value/Label)
      const opcionesVehiculos = [
          { value: 'all-vehicles', label: 'Todos los vehículos' },
          ...(vehiculosRes.data || []).map(v => ({ 
              value: v.id, 
              label: `${v.marca} ${v.modelo} - ${v.patente}` 
          }))
      ];

      const opcionesConductores = [
          { value: 'all-drivers', label: 'Todos los conductores' },
          ...(conductoresRes.data || []).map(c => ({ 
              value: c.id, 
              label: `${c.nombre} ${c.apellido}` 
          }))
      ];

      // 4. Actualizar Estado
      setDatos({
        metricas: metricasTransformadas,
        ingresosGastos: backendData.graficos.ingresos_gastos,
        consumoCombustible: backendData.graficos.consumo_combustible,
        estadoVehiculos: gastosPorTipo,
        rendimientoConductores: [],
        viajes: viajesTransformados,
        vehiculos: opcionesVehiculos,     
        conductores: opcionesConductores 
      });

    } catch (err) {
      console.error('Error al cargar reporte:', err);
      setError('No se pudieron cargar los datos financieros.');
      
      setDatos(prev => ({
          ...prev,
          vehiculos: prev.vehiculos.length ? prev.vehiculos : [{value: 'all', label: 'Error al cargar'}],
          conductores: prev.conductores.length ? prev.conductores : [{value: 'all', label: 'Error al cargar'}]
      }));
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (nuevosFiltros) => {
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