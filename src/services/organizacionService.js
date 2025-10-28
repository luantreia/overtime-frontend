import { fetchWithAuth } from '../utils/apiClient';
const API_URL = '/api/organizaciones';

export async function obtenerOrganizaciones() {
  const res = await fetchWithAuth(API_URL);
  if (!res.ok) throw new Error('Error al obtener organizaciones');
  return res.json();
}

export async function crearOrganizacion(datos, _token) {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear organización');
  }
  return res.json();
}
