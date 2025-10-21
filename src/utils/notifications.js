// src/utils/notifications.js
import toast from 'react-hot-toast';

/**
 * Sistema de notificaciones personalizado con react-hot-toast
 */
export const notifications = {
  // Notificaciones de éxito
  success: (message, options = {}) => {
    return toast.success(message, {
      icon: '✅',
      duration: 3000,
      ...options,
    });
  },

  // Notificaciones de error
  error: (message, options = {}) => {
    return toast.error(message, {
      icon: '❌',
      duration: 5000,
      ...options,
    });
  },

  // Notificaciones de advertencia
  warning: (message, options = {}) => {
    return toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
      ...options,
    });
  },

  // Notificaciones informativas
  info: (message, options = {}) => {
    return toast(message, {
      icon: 'ℹ️',
      duration: 4000,
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
      ...options,
    });
  },

  // Notificaciones de carga (promise-based)
  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Cargando...',
      success: messages.success || '¡Completado!',
      error: messages.error || 'Error al procesar',
    }, {
      ...options,
    });
  },

  // Notificaciones de carga personalizada
  loading: (message = 'Cargando...', options = {}) => {
    return toast.loading(message, {
      duration: 0, // No se oculta automáticamente
      ...options,
    });
  },

  // Ocultar notificación específica
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Ocultar todas las notificaciones
  dismissAll: () => {
    toast.dismiss();
  },
};

// Funciones de conveniencia para casos comunes
export const notify = {
  // Guardado exitoso
  saved: (item = 'elemento') => notifications.success(`✅ ${item} guardado correctamente`),

  // Eliminación exitosa
  deleted: (item = 'elemento') => notifications.success(`🗑️ ${item} eliminado correctamente`),

  // Error genérico
  error: (message = 'Ha ocurrido un error') => notifications.error(`❌ ${message}`),

  // Operación exitosa
  success: (message) => notifications.success(`✅ ${message}`),

  // Carga exitosa
  loaded: (item = 'datos') => notifications.success(`📊 ${item} cargados correctamente`),
};

// Exportar toast directamente para uso avanzado
export { toast };
export default notifications;

// Función para refrescar datos del cache (útil para capturas largas)
export const refreshCache = (queryClient) => ({
  // Refrescar datos de partidos
  refreshPartidos: () => queryClient.invalidateQueries(['partidos']),

  // Refrescar datos de un partido específico
  refreshPartido: (partidoId) => queryClient.invalidateQueries(['partido', partidoId]),

  // Refrescar todas las estadísticas
  refreshEstadisticas: () => queryClient.invalidateQueries(['estadisticas']),

  // Refrescar estadísticas de un partido
  refreshEstadisticasPartido: (partidoId) => queryClient.invalidateQueries(['estadisticas', 'partido', partidoId]),
});
