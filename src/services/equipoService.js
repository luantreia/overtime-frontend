// src/services/equipoService.js
import { fetchWithAuth } from '../utils/apiClient';
const API_URL = '/api';

export async function fetchEquipos(_token = null) {
  const res = await fetchWithAuth(`${API_URL}/equipos`);

  if (!res.ok) {
    console.error('❌ Error en fetchEquipos:', res.status, res.statusText);
    throw new Error('Error al cargar equipos');
  }

  const data = await res.json();
  console.log('✅ Equipos cargados:', data.length);
  return data;
}

export async function agregarEquipo(equipo, _token) {
  const res = await fetchWithAuth(`${API_URL}/equipos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipo),
  });
  if (!res.ok) throw new Error('Error al agregar equipo');
  return await res.json();
}

export async function editarEquipo(id, equipo, _token) {
  try {
    const res = await fetchWithAuth(`${API_URL}/equipos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

export async function eliminarEquipo(id, _token) {
  const res = await fetchWithAuth(`${API_URL}/equipos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar equipo');
  return true;
}

export async function fetchEquiposCompetenciaPorEquipo(equipoId, _token) {
  const res = await fetchWithAuth(`${API_URL}/equipos-competencia?equipo=${equipoId}`);
  if (!res.ok) throw new Error('Error al cargar equipos-competencia');
  return await res.json();
}
