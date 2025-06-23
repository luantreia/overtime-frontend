// src/services/partidoService.js

const API_URL = 'https://overtime-ddyl.onrender.com/api/partidos';

export async function fetchPartidos(token) {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar partidos');
  return await res.json();
}

export async function fetchPartidoById(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar partido');
  return await res.json();
}

export async function agregarPartido(partido, token) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(partido),
  });
  console.log('Token obtenido:', token);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al agregar partido');
  }
  return await res.json();
}

export async function editarPartido(id, partido, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(partido),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al editar partido');
  }
  return await res.json();
}

export async function eliminarPartido(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al eliminar partido');
  }
  return true;
}

export async function agregarSet(partidoId, setData, token) {
  console.log('Enviando a la API:', JSON.stringify(setData, null, 2));
  console.log('Token enviado:', token);
  console.log('🟡 Datos desde el hook:', setData);
  console.log('🟡 ENVIANDO A BACKEND setData:', JSON.stringify(setData, null, 2));
  const res = await fetch(`${API_URL}/${partidoId}/sets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(setData),
  });

  const text = await res.text(); // Leer como texto crudo
  console.log('Respuesta raw de backend:', text);

  if (!res.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || 'Error al crear set');
    } catch {
      throw new Error('Error al crear set y respuesta no es JSON');
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return null; // Si la respuesta no es JSON, retornamos null para evitar romper
  }
}

export async function actualizarSet(partidoId, numeroSet, setData, token) {
  const res = await fetch(`${API_URL}/${partidoId}/sets/${numeroSet}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(setData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al actualizar set');
  }
  return await res.json();
}

export async function eliminarSet(partidoId, numeroSet, token) {
  const res = await fetch(`${API_URL}/${partidoId}/sets/${numeroSet}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al eliminar set');
  }
  return true;
}

export async function actualizarStatsSet(partidoId, numeroSet, statsJugadoresSet, token) {
  const res = await fetch(`${API_URL}/${partidoId}/sets/${numeroSet}/stats`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ statsJugadoresSet }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al actualizar stats del set');
  }
  return await res.json();
}
