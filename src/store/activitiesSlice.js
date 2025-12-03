import { createSlice, createSelector } from '@reduxjs/toolkit';

const loadActivitiesFromStorage = () => {
  try {
    const stored = localStorage.getItem('activities');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error al cargar actividades desde localStorage:', error);
    return [];
  }
};

const saveActivitiesToStorage = (activities) => {
  try {
    localStorage.setItem('activities', JSON.stringify(activities));
  } catch (error) {
    console.error('Error al guardar actividades en localStorage:', error);
  }
};

const initialState = {
  items: loadActivitiesFromStorage(),
  filters: {
    type: 'all', 
    dateRange: null, 
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
        entity: action.payload.entity, 
        entityId: action.payload.entityId,
        timestamp: new Date().toISOString(),
        user: action.payload.user || 'Usuario actual',
        metadata: action.payload.metadata || {}
      };
      
      state.items.unshift(newActivity);
      
      if (state.items.length > 50) {
        state.items = state.items.slice(0, 50);
      }
      
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
