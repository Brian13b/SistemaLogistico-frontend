import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import {
  reportesEjemplo,
  metricsData,
  revenueData,
  fuelData,
  vehicleStatusData,
  driverPerformanceData,
  conductoresFiltro,
  vehiculosFiltro
} from '../utils/reportData';

export const useReportes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [datos, setDatos] = useState({
    conductores: conductoresFiltro,
    vehiculos: vehiculosFiltro,
    viajes: reportesEjemplo,
    metricas: metricsData,
    ingresosGastos: revenueData,
    consumoCombustible: fuelData,
    estadoVehiculos: vehicleStatusData,
    rendimientoConductores: driverPerformanceData
  });

  const [filtros, setFiltros] = useState({
    periodo: "30days",
    vehiculo: "all-vehicles",
    conductor: "all-drivers",
    fechaInicio: null,
    fechaFin: null
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Intentar cargar datos del backend
      let conductoresData = conductoresFiltro;
      let vehiculosData = vehiculosFiltro;
      let viajesData = reportesEjemplo;

      try {
        // Puedes adaptar las rutas según tu backend
        const [conductoresRes, vehiculosRes, viajesRes] = await Promise.all([
          fetch('/api/conductores'),
          fetch('/api/vehiculos'),
          fetch(`/api/reportes/gastos?periodo=${filtros.periodo}`)
        ]);
        if (conductoresRes.ok) conductoresData = await conductoresRes.json();
        if (vehiculosRes.ok) vehiculosData = await vehiculosRes.json();
        if (viajesRes.ok) viajesData = await viajesRes.json();
        showSuccess('Datos cargados desde el servidor');
      } catch (backendError) {
        console.log('Usando datos locales:', backendError.message);
        showWarning('Usando datos de ejemplo');
      }

      setDatos(prev => ({
        ...prev,
        conductores: conductoresData,
        vehiculos: vehiculosData,
        viajes: viajesData
      }));
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos de reportes');
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    setLoading(true);

    try {
      let viajesFiltrados = reportesEjemplo;

      try {
        // Construir query string para filtros
        const params = new URLSearchParams();
        if (nuevosFiltros.vehiculo && nuevosFiltros.vehiculo !== "all-vehicles")
          params.append('vehiculo', nuevosFiltros.vehiculo);
        if (nuevosFiltros.conductor && nuevosFiltros.conductor !== "all-drivers")
          params.append('conductor', nuevosFiltros.conductor);
        if (nuevosFiltros.periodo)
          params.append('periodo', nuevosFiltros.periodo);
        if (nuevosFiltros.fechaInicio)
          params.append('fechaInicio', nuevosFiltros.fechaInicio);
        if (nuevosFiltros.fechaFin)
          params.append('fechaFin', nuevosFiltros.fechaFin);

        const res = await fetch(`/api/reportes/gastos?${params.toString()}`);
        if (res.ok) {
          viajesFiltrados = await res.json();
        } else {
          throw new Error('Backend error');
        }
      } catch (backendError) {
        console.log('Filtrando datos locales:', backendError.message);
        viajesFiltrados = filtrarDatosLocales(reportesEjemplo, nuevosFiltros);
      }

      setDatos(prev => ({
        ...prev,
        viajes: viajesFiltrados
      }));

      showSuccess(`Filtros aplicados: ${viajesFiltrados.length} viajes encontrados`);
    } catch (err) {
      console.error('Error al aplicar filtros:', err);
      setError('Error al aplicar los filtros');
      showError('Error al aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  const filtrarDatosLocales = (viajes, filtros) => {
    let viajesFiltrados = [...viajes];

    // Filtrar por conductor
    if (filtros.conductor && filtros.conductor !== "all-drivers") {
      const conductorSeleccionado = datos.conductores.find(c => c.value === filtros.conductor);
      if (conductorSeleccionado) {
        viajesFiltrados = viajesFiltrados.filter(viaje =>
          viaje.conductor === conductorSeleccionado.label
        );
      }
    }

    // Filtrar por vehículo
    if (filtros.vehiculo && filtros.vehiculo !== "all-vehicles") {
      const vehiculoSeleccionado = datos.vehiculos.find(v => v.value === filtros.vehiculo);
      if (vehiculoSeleccionado) {
        viajesFiltrados = viajesFiltrados.filter(viaje =>
          viaje.patente === vehiculoSeleccionado.label.split(' - ')[1]
        );
      }
    }

    // Filtrar por período
    if (filtros.periodo) {
      const fechaLimite = new Date();
      switch (filtros.periodo) {
        case "7days":
          fechaLimite.setDate(fechaLimite.getDate() - 7);
          break;
        case "30days":
          fechaLimite.setDate(fechaLimite.getDate() - 30);
          break;
        case "90days":
          fechaLimite.setDate(fechaLimite.getDate() - 90);
          break;
        case "year":
          fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
          break;
      }

      viajesFiltrados = viajesFiltrados.filter(viaje =>
        new Date(viaje.fecha) >= fechaLimite
      );
    }

    return viajesFiltrados;
  };

  const exportarReporte = async (formato = 'csv') => {
    try {
      // Intentar exportar desde el backend
      let url = `/api/reportes/gastos/exportar?formato=${formato}`;
      // Puedes agregar filtros al exportar si lo deseas
      const params = new URLSearchParams();
      if (filtros.vehiculo && filtros.vehiculo !== "all-vehicles")
        params.append('vehiculo', filtros.vehiculo);
      if (filtros.conductor && filtros.conductor !== "all-drivers")
        params.append('conductor', filtros.conductor);
      if (filtros.periodo)
        params.append('periodo', filtros.periodo);
      if (filtros.fechaInicio)
        params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin)
        params.append('fechaFin', filtros.fechaFin);
      if (params.toString()) url += `&${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `reporte-viajes-${new Date().toISOString().split('T')[0]}.${formato}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        showSuccess(`Reporte exportado desde el servidor`);
      } else {
        throw new Error('Backend error');
      }
    } catch (err) {
      // Si falla, exporta localmente
      console.error('Error al exportar desde backend, usando datos locales:', err);
      const csvContent = crearCSV(datos.viajes);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-viajes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showWarning('Reporte exportado con datos de ejemplo');
    }
  };

  const crearCSV = (viajes) => {
    const headers = [
      'ID',
      'Patente',
      'Conductor',
      'Origen',
      'Destino',
      'Fecha',
      'Kilómetros',
      'Combustible (L)',
      'Costo',
      'Estado'
    ];

    const csvRows = [
      headers.join(','),
      ...viajes.map(viaje => [
        viaje.id,
        viaje.patente,
        viaje.conductor,
        viaje.origen,
        viaje.destino,
        viaje.fecha,
        viaje.kilometros,
        viaje.combustible,
        viaje.costo,
        viaje.estado
      ].join(','))
    ];

    return csvRows.join('\n');
  };

  const obtenerMetricas = async () => {
    try {
      const response = await fetch('/api/reportes/metricas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filtros)
      });

      if (response.ok) {
        const metricas = await response.json();
        setDatos(prev => ({
          ...prev,
          metricas: metricas
        }));
      }
    } catch (err) {
      console.error('Error al obtener métricas:', err);
    }
  };

  return {
    datos,
    filtros,
    loading,
    error,
    aplicarFiltros,
    exportarReporte,
    obtenerMetricas,
    cargarDatos
  };
};