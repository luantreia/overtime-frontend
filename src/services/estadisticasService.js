// src/services/estadisticasService.js
const API_URL = 'https://overtime-ddyl.onrender.com/api';

// Obtener todos los sets (y estadísticas) de un partido
export async function fetchEstadisticasDePartido(partidoId, token) {
  const res = await fetch(`${API_URL}/partidos/${partidoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al obtener estadísticas');
  }
  return await res.json(); // devuelve { sets: [...] }
}

// Crear estadísticas de un jugador por partido
export async function crearEstadisticasJugadorPartido(jugadorPartido, estadisticas, token) {
  const res = await fetch(`${API_URL}/estadisticas/jugador-partido`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      jugadorPartido,
      ...estadisticas
    }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al crear estadísticas del partido');
  }
  return await res.json();
}

// Actualizar estadísticas de un jugador por partido
export async function actualizarEstadisticasJugadorPartido(estadisticaId, estadisticas, token) {
  const res = await fetch(`${API_URL}/estadisticas/jugador-partido/${estadisticaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(estadisticas),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al actualizar estadísticas del partido');
  }
  return await res.json();
}

// Crear estadísticas de un jugador por set
export async function crearEstadisticasJugadorSet(setId, jugadorPartido, jugador, equipo, estadisticas, token) {
  const res = await fetch(`${API_URL}/estadisticas/jugador-set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      set: setId,
      jugadorPartido,
      jugador,
      equipo,
      ...estadisticas
    }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al crear estadísticas del set');
  }
  return await res.json();
}

// Actualizar estadísticas de un jugador por set
export async function actualizarEstadisticasJugadorSet(estadisticaId, estadisticas, token) {
  const res = await fetch(`${API_URL}/estadisticas/jugador-set/${estadisticaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(estadisticas),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al actualizar estadísticas del set');
  }
  return await res.json();
}

// Función legacy para compatibilidad
export async function guardarEstadistica(partidoId, numeroSet, jugadorId, estadistica, token) {
  console.warn('guardarEstadistica está deprecated, usar las nuevas funciones específicas');
  // Esta función se mantiene por compatibilidad pero se recomienda usar las nuevas
  return { message: 'Usar las nuevas funciones de estadísticas' };
}