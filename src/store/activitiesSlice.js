import { createSlice, createSelector } from '@reduxjs/toolkit';

// Cargar actividades desde localStorage
const loadActivitiesFromStorage = () => {
  try {
    const stored = localStorage.getItem('activities');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading activities from localStorage:', error);
    return [];
  }
};

// Guardar actividades en localStorage
const saveActivitiesToStorage = (activities) => {
  try {
    localStorage.setItem('activities', JSON.stringify(activities));
  } catch (error) {
    console.error('Error saving activities to localStorage:', error);
  }
};

const initialState = {
  items: loadActivitiesFromStorage(),
  filters: {
    type: 'all', // 'all', 'vehiculo', 'conductor', 'viaje', 'documento'
    dateRange: null, // { start: Date, end: Date }
    search: ''
  },
  isLoading: false,
  error: null
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addActivity: (state, action) => {
      const newActivity = {
        id: Date.now() + Math.random(),
        type: action.payload.type,
        title: action.payload.title,
        description: action.payload.description,
        entity: action.payload.entity, // 'vehiculo', 'conductor', 'viaje', etc.
        entityId: action.payload.entityId,
        timestamp: new Date().toISOString(),
        user: action.payload.user || 'Usuario actual',
        metadata: action.payload.metadata || {}
      };
      
      state.items.unshift(newActivity);
      
      // Mantener solo las últimas 100 actividades
      if (state.items.length > 100) {
        state.items = state.items.slice(0, 100);
      }
      
      // Guardar en localStorage
      saveActivitiesToStorage(state.items);
    },
    
    clearActivities: (state) => {
      state.items = [];
      saveActivitiesToStorage([]);
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const { 
  addActivity, 
  clearActivities, 
  setFilters, 
  setLoading, 
  setError 
} = activitiesSlice.actions;

// Selectores
export const selectAllActivities = (state) => state.activities.items;
export const selectFilteredActivities = createSelector(
  [(state) => state.activities.items, (state) => state.activities.filters],
  (items, filters) => {
    let filtered = items;
    
    // Filtrar por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === filters.type);
    }
    
    // Filtrar por rango de fechas
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= start && activityDate <= end;
      });
    }
    
    // Filtrar por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }
);

export const selectRecentActivities = createSelector(
  [(state) => state.activities.items],
  (items) => items.slice(0, 5)
);

export default activitiesSlice.reducer;
