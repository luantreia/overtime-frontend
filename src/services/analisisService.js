import { fetchWithAuth } from '../utils/apiClient';
const API_BASE = '/api/partidos';

export async function fetchAnalisisPartido(id, _token) {
  const res = await fetchWithAuth(`${API_BASE}/${id}/analisis`);
  if (!res.ok) throw new Error('Error al obtener análisis');
  return await res.json();
}
