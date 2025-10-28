import { fetchWithAuth } from '../utils/apiClient';
const API_BASE = '/api';
const API_URL = `${API_BASE}/jugadores`;

export async function fetchJugadores(_token) {
  const res = await fetchWithAuth(API_URL);
  if (!res.ok) throw new Error('Error al cargar jugadores');
  return await res.json();
}

export async function agregarJugador(jugador, _token) {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jugador),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al agregar jugador');
  }
  return await res.json();
}

export async function editarJugador(id, jugador, _token) {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jugador),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al editar jugador');
  }
  return await res.json();
}

export async function eliminarJugador(id, _token) {
  const res = await fetchWithAuth(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al eliminar jugador');
  }
  return true;
}

export async function fetchJugadoresPorEquipo(equipoId, _token) {
  if (!equipoId) return [];
  // 1) Intento endpoint dedicado de jugadores por equipo
  const res = await fetchWithAuth(`${API_URL}/por-equipo/${equipoId}`);
  try {
    if (res.ok) {
      const lista = await res.json();
      if (Array.isArray(lista) && lista.length > 0) return lista;
    }
  } catch (_) {
    // ignore, fallback abajo
  }

  // 2) Fallback: relaciones jugador-equipo pobladas y mapear a jugadores
  try {
    const resRel = await fetchWithAuth(`${API_BASE}/jugador-equipo?equipo=${equipoId}&activo=true`);
    if (!resRel.ok) {
      const t = await resRel.text();
      throw new Error(t || 'Error al cargar relaciones jugador-equipo');
    }
    const relaciones = await resRel.json();
    if (Array.isArray(relaciones)) {
      return relaciones
        .map(r => r?.jugador)
        .filter(Boolean);
    }
    return [];
  } catch (err) {
    // 3) Último recurso: vacío
    return [];
  }
}
