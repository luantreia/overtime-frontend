const API_URL = 'https://overtime-ddyl.onrender.com/api/organizaciones';

export async function obtenerOrganizaciones() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener organizaciones');
  return res.json();
}

export async function crearOrganizacion(datos, token) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear organización');
  }
  return res.json();
}
