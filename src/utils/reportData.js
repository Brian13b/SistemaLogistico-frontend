export const tiposReportes = [
    { id: 'viajes', nombre: 'Reporte de Viajes', color: 'blue' },
    { id: 'vehiculos', nombre: 'Reporte de Vehículos', color: 'green' },
    { id: 'conductores', nombre: 'Reporte de Conductores', color: 'yellow' },
    { id: 'facturacion', nombre: 'Reporte de Facturación', color: 'red' },
  ];
  
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