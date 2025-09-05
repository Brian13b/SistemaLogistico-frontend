export const tiposReportes = [
  { id: 'viajes', nombre: 'Reporte de Viajes', color: 'blue' },
  { id: 'vehiculos', nombre: 'Reporte de Vehículos', color: 'green' },
  { id: 'conductores', nombre: 'Reporte de Conductores', color: 'yellow' },
  { id: 'facturacion', nombre: 'Reporte de Facturación', color: 'red' },
];

// Datos para ReportesOverview
export const metricsData = [
  {
    title: "Ingresos Totales",
    value: "$354830.54",
    change: "+12.5%",
    trend: "up",
    icon: "DollarSign",
    color: "text-green-600",
  },
  {
    title: "Gastos de Combustible",
    value: "$1254785.20",
    change: "-3.2%",
    trend: "down",
    icon: "Fuel",
    color: "text-blue-600",
  },
  {
    title: "Horas de Conducción",
    value: "1,247h",
    change: "+8.1%",
    trend: "up",
    icon: "Clock",
    color: "text-purple-600",
  },
  {
    title: "Conductores Activos",
    value: "3",
    change: "+2",
    trend: "up",
    icon: "Users",
    color: "text-orange-600",
  },
];

// Datos para ReportesCharts
export const revenueData = [
  { mes: "Ene", ingresos: 3548308.54, gastos: 1254785.20 },
  { mes: "Feb", ingresos: 3712799.25, gastos: 1181258.87 },
  { mes: "Mar", ingresos: 3641165.29, gastos: 1247821.65 },
  { mes: "Abr", ingresos: 3254789.78, gastos: 1026589.34 },
  { mes: "May", ingresos: 3314582.02, gastos: 1087541.61 },
  { mes: "Jun", ingresos: 3457921.09, gastos: 1154128.96 },
];

export const fuelData = [
  { dia: "Lun", consumo: 120 },
  { dia: "Mar", consumo: 98 },
  { dia: "Mié", consumo: 145 },
  { dia: "Jue", consumo: 132 },
  { dia: "Vie", consumo: 156 },
  { dia: "Sáb", consumo: 89 },
  { dia: "Dom", consumo: 67 },
];

export const vehicleStatusData = [
  { nombre: "Activos", valor: 2, color: "#10B981" },
  { nombre: "Mantenimiento", valor: 1, color: "#F59E0B" },
  { nombre: "Inactivos", valor: 1, color: "#EF4444" },
];

export const driverPerformanceData = [
  { nombre: "Juan Pérez", viajes: 45, eficiencia: 92, color: "bg-green-500" },
  { nombre: "María García", viajes: 38, eficiencia: 88, color: "bg-blue-500" },
  { nombre: "Carlos López", viajes: 42, eficiencia: 85, color: "bg-yellow-500" },
  { nombre: "Ana Martín", viajes: 35, eficiencia: 90, color: "bg-purple-500" },
];

// Datos para ReportesTable
export const reportesEjemplo = [
  {
    id: "V001",
    patente: "ABC123",
    conductor: "Juan Pérez",
    origen: "Rosario",
    destino: "Córdoba",
    fecha: "2024-08-01",
    kilometros: 400,
    combustible: 60,
    costo: 15000,
    estado: "FINALIZADO",
  },
  {
    id: "V002",
    patente: "DEF456",
    conductor: "María García",
    origen: "Santa Fe",
    destino: "Buenos Aires",
    fecha: "2024-08-03",
    kilometros: 480,
    combustible: 70,
    costo: 18000,
    estado: "EN_PROGRESO",
  },
  {
    id: "V003",
    patente: "GHI789",
    conductor: "Carlos López",
    origen: "Mendoza",
    destino: "San Juan",
    fecha: "2024-08-05",
    kilometros: 180,
    combustible: 25,
    costo: 7000,
    estado: "PROGRAMADO",
  },
  {
    id: "V004",
    patente: "JKL012",
    conductor: "Ana Martín",
    origen: "Tucumán",
    destino: "Salta",
    fecha: "2024-08-07",
    kilometros: 320,
    combustible: 40,
    costo: 12000,
    estado: "CANCELADO",
  },
];

export const estadosMap = {
  PROGRAMADO: { text: "Programado", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  EN_PROGRESO: { text: "En progreso", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  FINALIZADO: { text: "Finalizado", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  CANCELADO: { text: "Cancelado", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

// Datos para filtros
export const periodosFiltro = [
  { value: "7days", label: "Últimos 7 días" },
  { value: "30days", label: "Últimos 30 días" },
  { value: "90days", label: "Últimos 90 días" },
  { value: "year", label: "Este año" },
];

export const vehiculosFiltro = [
  { value: "all-vehicles", label: "Todos los vehículos" },
  { value: "truck-001", label: "Camión 001" },
  { value: "truck-002", label: "Camión 002" },
  { value: "van-001", label: "Furgoneta 001" },
];

export const conductoresFiltro = [
  { value: "all-drivers", label: "Todos los conductores" },
  { value: "driver-1", label: "Juan Pérez" },
  { value: "driver-2", label: "María García" },
  { value: "driver-3", label: "Carlos López" },
];

// Datos de ejemplo para conectar con el backend
export const datosEjemplo = {
  viajes: [
    { id: 1, origen: 'Buenos Aires', destino: 'Córdoba', fecha: '03/04/2025', kilometros: 700 },
    { id: 2, origen: 'Rosario', destino: 'Mendoza', fecha: '05/04/2025', kilometros: 790 },
    { id: 3, origen: 'La Plata', destino: 'Mar del Plata', fecha: '10/04/2025', kilometros: 370 },
  ],
  vehiculos: [
    { id: 'VH001', patente: 'AB123CD', marca: 'Toyota', modelo: 'Hilux', año: 2023, km: 35000 },
    { id: 'VH002', patente: 'AC456DE', marca: 'Ford', modelo: 'Ranger', año: 2022, km: 42000 },
  ],
  conductores: [
    { id: 'C001', nombre: 'Juan Pérez', licencia: 'B12345', vencimiento: '12/2025', viajes: 45 },
    { id: 'C002', nombre: 'María López', licencia: 'B67890', vencimiento: '08/2026', viajes: 38 },
  ],
  facturacion: [
    { num: 'FC-001', cliente: 'Transportes SA', monto: 145000, fecha: '02/04/2025', estado: 'Pagada' },
    { num: 'FC-002', cliente: 'Logística ABC', monto: 87500, fecha: '08/04/2025', estado: 'Pendiente' },
  ]
};