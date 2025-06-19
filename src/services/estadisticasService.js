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

// Guardar/Actualizar estadísticas de un jugador en un set
export async function guardarEstadistica(partidoId, numeroSet, jugadorId, estadistica, token) {
  const res = await fetch(`${API_URL}/partidos/${partidoId}/sets/${numeroSet}/jugador/${jugadorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estadistica }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al guardar estadística');
  }
  return await res.json();
}