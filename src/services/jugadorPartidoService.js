// src/services/jugadorPartidoService.js
const API_URL = 'https://overtime-ddyl.onrender.com/api/jugador-partido';

// Obtener jugadores de un partido
export async function obtenerJugadoresPartido(partidoId, token) {
  const res = await fetch(`${API_URL}?partido=${partidoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al obtener jugadores del partido');
  }
  return await res.json();
}

// Agregar jugador al partido
export async function agregarJugadorPartido(jugadorPartidoData, token) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jugadorPartidoData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al agregar jugador al partido');
  }
  return await res.json();
}

// Actualizar jugador en partido
export async function actualizarJugadorPartido(jugadorPartidoId, data, token) {
  const res = await fetch(`${API_URL}/${jugadorPartidoId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al actualizar jugador en partido');
  }
  return await res.json();
}

// Eliminar jugador del partido
export async function eliminarJugadorPartido(jugadorPartidoId, token) {
  const res = await fetch(`${API_URL}/${jugadorPartidoId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al eliminar jugador del partido');
  }
  return true;
}
