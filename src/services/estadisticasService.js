// src/services/estadisticasService.js
import { fetchWithAuth } from '../utils/apiClient';
const API_URL = '/api';

// Obtener todos los sets (y estadísticas) de un partido
export async function fetchEstadisticasDePartido(partidoId, _token) {
  const res = await fetchWithAuth(`${API_URL}/partidos/${partidoId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al obtener estadísticas');
  }
  return await res.json(); // devuelve { sets: [...] }
}

// Crear estadísticas de un jugador por partido
export async function crearEstadisticasJugadorPartido(jugadorPartido, estadisticas, _token) {
  const res = await fetchWithAuth(`${API_URL}/estadisticas/jugador-partido`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
export async function actualizarEstadisticasJugadorPartido(estadisticaId, estadisticas, _token) {
  const res = await fetchWithAuth(`${API_URL}/estadisticas/jugador-partido/${estadisticaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estadisticas),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al actualizar estadísticas del partido');
  }
  return await res.json();
}

// Crear estadísticas de un jugador por set
export async function crearEstadisticasJugadorSet(setId, jugadorPartido, jugador, equipo, estadisticas, _token) {
  const res = await fetchWithAuth(`${API_URL}/estadisticas/jugador-set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
export async function actualizarEstadisticasJugadorSet(estadisticaId, estadisticas, _token) {
  const res = await fetchWithAuth(`${API_URL}/estadisticas/jugador-set/${estadisticaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estadisticas),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al actualizar estadísticas del set');
  }
  return await res.json();
}

// Función legacy para compatibilidad
export async function guardarEstadistica(partidoId, numeroSet, jugadorId, estadistica, _token) {
  console.warn('guardarEstadistica está deprecated, usar las nuevas funciones específicas');
  // Esta función se mantiene por compatibilidad pero se recomienda usar las nuevas
  return { message: 'Usar las nuevas funciones de estadísticas' };
}