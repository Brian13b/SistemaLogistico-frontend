import { addActivity } from './activitiesSlice';

// Mapeo de acciones a tipos de actividad
const actionToActivityType = {
  // Vehículos
  'vehiculos/create/fulfilled': {
    type: 'vehiculo_creado',
    title: 'Vehículo Creado',
    entity: 'vehiculo'
  },
  'vehiculos/update/fulfilled': {
    type: 'vehiculo_actualizado',
    title: 'Vehículo Actualizado',
    entity: 'vehiculo'
  },
  'vehiculos/delete/fulfilled': {
    type: 'vehiculo_eliminado',
    title: 'Vehículo Eliminado',
    entity: 'vehiculo'
  },
  
  // Conductores
  'conductores/create/fulfilled': {
    type: 'conductor_creado',
    title: 'Conductor Creado',
    entity: 'conductor'
  },
  'conductores/update/fulfilled': {
    type: 'conductor_actualizado',
    title: 'Conductor Actualizado',
    entity: 'conductor'
  },
  'conductores/delete/fulfilled': {
    type: 'conductor_eliminado',
    title: 'Conductor Eliminado',
    entity: 'conductor'
  },
  
  // Viajes
  'viajes/create/fulfilled': {
    type: 'viaje_creado',
    title: 'Viaje Creado',
    entity: 'viaje'
  },
  'viajes/update/fulfilled': {
    type: 'viaje_actualizado',
    title: 'Viaje Actualizado',
    entity: 'viaje'
  },
  'viajes/delete/fulfilled': {
    type: 'viaje_eliminado',
    title: 'Viaje Eliminado',
    entity: 'viaje'
  },
  'viajes/start/fulfilled': {
    type: 'viaje_iniciado',
    title: 'Viaje Iniciado',
    entity: 'viaje'
  },
  'viajes/complete/fulfilled': {
    type: 'viaje_completado',
    title: 'Viaje Completado',
    entity: 'viaje'
  },
  
  // Usuarios
  'users/update/fulfilled': {
    type: 'usuario_actualizado',
    title: 'Usuario Actualizado',
    entity: 'usuario'
  },
  'users/updateCurrent/fulfilled': {
    type: 'perfil_actualizado',
    title: 'Perfil Actualizado',
    entity: 'usuario'
  },
  'users/delete/fulfilled': {
    type: 'usuario_eliminado',
    title: 'Usuario Eliminado',
    entity: 'usuario'
  },
  
  // Documentos
  'documentos/uploadDocumento': {
    type: 'documento_subido',
    title: 'Documento Subido',
    entity: 'documento'
  },
  'documentos/deleteDocumento': {
    type: 'documento_eliminado',
    title: 'Documento Eliminado',
    entity: 'documento'
  }
};

// Middleware de actividades
export const activitiesMiddleware = (store) => (next) => (action) => {
  // Ejecutar la acción original
  const result = next(action);
  
  // Verificar si es una acción que debe generar actividad
  const activityConfig = actionToActivityType[action.type];
  
  if (activityConfig) {
    // Generar descripción basada en el tipo de acción y datos
    const description = generateActivityDescription(action, activityConfig);
    
    // Despachar la actividad
    store.dispatch(addActivity({
      type: activityConfig.type,
      title: activityConfig.title,
      description: description,
      entity: activityConfig.entity,
      entityId: action.payload?.id || action.payload?.vehiculoId || action.payload?.conductorId || action.payload?.viajeId,
      metadata: {
        actionType: action.type,
        payload: action.payload
      }
    }));
  }
  
  return result;
};

// Generar descripción de actividad basada en la acción
const generateActivityDescription = (action, config) => {
  const { type, payload } = action;
  
  switch (config.entity) {
    case 'vehiculo':
      if (type.includes('create')) {
        return `Vehículo ${payload?.patente || payload?.id} creado exitosamente`;
      } else if (type.includes('update')) {
        return `Vehículo ${payload?.patente || payload?.id} actualizado`;
      } else if (type.includes('delete')) {
        return `Vehículo ${payload?.patente || payload?.id} eliminado`;
      }
      break;
      
    case 'conductor':
      if (type.includes('create')) {
        return `Conductor ${payload?.nombre || payload?.id} creado exitosamente`;
      } else if (type.includes('update')) {
        return `Conductor ${payload?.nombre || payload?.id} actualizado`;
      } else if (type.includes('delete')) {
        return `Conductor ${payload?.nombre || payload?.id} eliminado`;
      }
      break;
      
    case 'viaje':
      if (type.includes('create')) {
        return `Viaje ${payload?.codigo || payload?.id} creado de ${payload?.origen} a ${payload?.destino}`;
      } else if (type.includes('update')) {
        return `Viaje ${payload?.codigo || payload?.id} actualizado`;
      } else if (type.includes('delete')) {
        return `Viaje ${payload?.codigo || payload?.id} eliminado`;
      } else if (type.includes('start')) {
        return `Viaje ${payload?.codigo || payload?.id} iniciado`;
      } else if (type.includes('complete')) {
        return `Viaje ${payload?.codigo || payload?.id} completado`;
      }
      break;
      
    case 'documento':
      if (type.includes('upload')) {
        return `Documento ${payload?.tipo || payload?.archivo_nombre} subido para ${payload?.entidad}`;
      } else if (type.includes('delete')) {
        return `Documento ${payload?.tipo || payload?.archivo_nombre} eliminado`;
      }
      break;
      
    default:
      return `Acción ${config.title.toLowerCase()} realizada`;
  }
  
  return `Acción ${config.title.toLowerCase()} realizada`;
};

export default activitiesMiddleware;
