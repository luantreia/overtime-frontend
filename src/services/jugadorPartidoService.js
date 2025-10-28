// src/services/jugadorPartidoService.js
import { fetchWithAuth } from '../utils/apiClient';
const API_URL = '/api/jugador-partido';

// Obtener jugadores de un partido
export async function obtenerJugadoresPartido(partidoId, _token) {
  const res = await fetchWithAuth(`${API_URL}?partido=${partidoId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al obtener jugadores del partido');
  }
  return await res.json();
}

// Agregar jugador al partido
export async function agregarJugadorPartido(jugadorPartidoData, _token) {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jugadorPartidoData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al agregar jugador al partido');
  }
  return await res.json();
}

// Actualizar jugador en partido
export async function actualizarJugadorPartido(jugadorPartidoId, data, _token) {
  const res = await fetchWithAuth(`${API_URL}/${jugadorPartidoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al actualizar jugador en partido');
  }
  return await res.json();
}

// Eliminar jugador del partido
export async function eliminarJugadorPartido(jugadorPartidoId, _token) {
  const res = await fetchWithAuth(`${API_URL}/${jugadorPartidoId}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al eliminar jugador del partido');
  }
  return true;
}
