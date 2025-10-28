import { fetchWithAuth } from '../utils/apiClient';

const API_URL = '/api/competencias';

// Obtener todas las competencias (público)
export async function obtenerCompetencias() {
  const res = await fetchWithAuth(API_URL);
  if (!res.ok) throw new Error('Error al obtener competencias');
  return res.json();
}

// Obtener una competencia por ID (puede requerir token si es privada)
export async function obtenerCompetenciaPorId(id, _token) {
  const res = await fetchWithAuth(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al cargar comp');
  return await res.json();
}


// Crear una competencia (requiere token)
export async function crearCompetencia(data, _token) {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear competencia');
  }
  return res.json();
}

// Actualizar una competencia (requiere token)
export async function actualizarCompetencia(id, data, _token) {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar competencia');
  }
  return res.json();
}

// Eliminar una competencia (requiere token)
export async function eliminarCompetencia(id, _token) {
  const res = await fetchWithAuth(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar competencia');
  }
  return res.json();
}
