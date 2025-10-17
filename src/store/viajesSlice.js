import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { viajesService } from '../services/ViajesService.js';

export const fetchViajes = createAsyncThunk('viajes/fetchAll', async () => {
  const response = await viajesService.getAll();
  return response.data;
});

export const createViaje = createAsyncThunk('viajes/create', async (viajeData) => {
  const response = await viajesService.create(viajeData);
  return response.data;
});

export const updateViaje = createAsyncThunk('viajes/update', async ({ id, viajeData }) => {
  const response = await viajesService.update(id, viajeData);
  return response.data;
});

export const deleteViaje = createAsyncThunk('viajes/delete', async (id) => {
  const response = await viajesService.delete(id);
  return response.data;
});

export const startViaje = createAsyncThunk('viajes/start', async (id) => {
  const response = await viajesService.start(id);
  return response.data;
});

export const completeViaje = createAsyncThunk('viajes/complete', async (id) => {
  const response = await viajesService.complete(id);
  return response.data;
});

const viajesSlice = createSlice({
  name: 'viajes',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchViajes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchViajes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchViajes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createViaje.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateViaje.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteViaje.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload.id);
      })
      .addCase(startViaje.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(completeViaje.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default viajesSlice.reducer;


