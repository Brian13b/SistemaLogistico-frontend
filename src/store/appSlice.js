import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  lastUpdated: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    setLastUpdated(state, action) {
      state.lastUpdated = action.payload ?? new Date().toISOString();
    },
  },
});

export const { setLoading, setLastUpdated } = appSlice.actions;
export default appSlice.reducer;


