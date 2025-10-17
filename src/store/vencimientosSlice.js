import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehiculoDocumentosService } from '../services/VehiculoDocumentosServices.js';
import { conductorDocumentosService } from '../services/ConductorDocumentosServices.js';
import { viajesDocumentosService } from '../services/ViajesDocumentosService.js';

const procesar = (docs, tipoEntidad) => docs.map(doc => {
  const fechaVenc = new Date(doc.fecha_vencimiento);
  const hoy = new Date();
  const diffDias = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
  if (diffDias < 0 || diffDias > 30) return null;
  return {
    tipo: doc.tipo_documento,
    fecha: fechaVenc.toISOString(), // Convertir a string serializable
    descripcion: doc.archivo_nombre,
    entidad: tipoEntidad,
    vehiculo: doc.id_vehiculo,
    conductor: doc.id_conductor,
    viaje: doc.viaje_id,
    critico: diffDias < 10,
    warning: diffDias >= 10 && diffDias <= 30
  };
}).filter(Boolean);

export const fetchVencimientos = createAsyncThunk('vencimientos/fetch30d', async () => {
  const [vehiculosRes, conductoresRes, viajesRes] = await Promise.all([
    vehiculoDocumentosService.getProximosVencimientos(30),
    conductorDocumentosService.getProximosVencimientos(30),
    viajesDocumentosService.getProximosVencimientos(30),
  ]);

  const vencimientosUnificados = [
    ...procesar(vehiculosRes.data, 'vehiculo'),
    ...procesar(conductoresRes.data, 'conductor'),
    ...procesar(viajesRes.data, 'viaje'),
  ];
  return vencimientosUnificados;
});

const vencimientosSlice = createSlice({
  name: 'vencimientos',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVencimientos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVencimientos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchVencimientos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default vencimientosSlice.reducer;


