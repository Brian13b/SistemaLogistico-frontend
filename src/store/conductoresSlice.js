import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { conductoresService } from '../services/ConductoresService.js';

export const fetchConductores = createAsyncThunk('conductores/fetchAll', async () => {
  const response = await conductoresService.getAll();
  return response.data;
});

export const createConductor = createAsyncThunk('conductores/create', async (conductorData) => {
  const response = await conductoresService.create(conductorData);
  return response.data;
});

export const updateConductor = createAsyncThunk('conductores/update', async ({ id, conductorData }) => {
  const response = await conductoresService.update(id, conductorData);
  return response.data;
});

export const deleteConductor = createAsyncThunk('conductores/delete', async (id) => {
  const response = await conductoresService.delete(id);
  return response.data;
});

const conductoresSlice = createSlice({
  name: 'conductores',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConductores.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConductores.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchConductores.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createConductor.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateConductor.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteConductor.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload.id);
      });
  },
});

export default conductoresSlice.reducer;


