export async function fetchAnalisisPartido(id, token) {
  const res = await fetch(`${API_URL}/${id}/analisis`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al obtener análisis');
  return await res.json();
}
