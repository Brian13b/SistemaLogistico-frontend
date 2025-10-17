import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import vehiculosReducer from './vehiculosSlice.js';
import conductoresReducer from './conductoresSlice.js';
import viajesReducer from './viajesSlice.js';
import vencimientosReducer from './vencimientosSlice.js';
import usersReducer from './usersSlice.js';
import activitiesReducer from './activitiesSlice.js';
import { activitiesMiddleware } from './activitiesMiddleware.js';

export const store = configureStore({
  reducer: {
    app: appReducer,
    vehiculos: vehiculosReducer,
    conductores: conductoresReducer,
    viajes: viajesReducer,
    vencimientos: vencimientosReducer,
    users: usersReducer,
    activities: activitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['vencimientos/fetch30d/fulfilled'],
        ignoredPaths: ['vencimientos.items.fecha']
      }
    }).concat(activitiesMiddleware),
});

export default store;


