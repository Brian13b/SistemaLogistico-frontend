import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehiculosService } from '../services/VehiculosService.js';

export const fetchVehiculos = createAsyncThunk('vehiculos/fetchAll', async () => {
  const response = await vehiculosService.getAll();
  return response.data;
});

export const createVehiculo = createAsyncThunk('vehiculos/create', async (vehiculoData) => {
  const response = await vehiculosService.create(vehiculoData);
  return response.data;
});

export const updateVehiculo = createAsyncThunk('vehiculos/update', async ({ id, vehiculoData }) => {
  const response = await vehiculosService.update(id, vehiculoData);
  return response.data;
});

export const deleteVehiculo = createAsyncThunk('vehiculos/delete', async (id) => {
  const response = await vehiculosService.delete(id);
  return response.data;
});

const vehiculosSlice = createSlice({
  name: 'vehiculos',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehiculos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVehiculos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchVehiculos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createVehiculo.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateVehiculo.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteVehiculo.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload.id);
      });
  },
});

export default vehiculosSlice.reducer;


