// src/services/equipoService.js

const API_URL = 'https://overtime-ddyl.onrender.com/api';

export async function fetchEquipos(token) {
  const res = await fetch(`${API_URL}/equipos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al cargar equipos');
  return await res.json();
}

export async function agregarEquipo(equipo, token) {
  const res = await fetch(`${API_URL}/equipos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(equipo),
  });
  if (!res.ok) throw new Error('Error al agregar equipo');
  return await res.json();
}

export async function editarEquipo(id, equipo, token) {
  try {
    const res = await fetch(`${API_URL}/equipos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(equipo),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Error al editar equipo (res no ok):', data);
      throw new Error(data.message || 'Error al editar equipo');
    }

    return data;
  } catch (err) {
    console.error('❌ Error en fetch editarEquipo:', err);
    throw err;
  }
}

export async function eliminarEquipo(id, token) {
  const res = await fetch(`${API_URL}/equipos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al eliminar equipo');
  return true;
}
