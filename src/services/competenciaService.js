const API_URL = 'https://overtime-ddyl.onrender.com/api/competencias';

// Obtener todas las competencias (público)
export async function obtenerCompetencias() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener competencias');
  return res.json();
}

// Obtener una competencia por ID (puede requerir token si es privada)
export async function obtenerCompetenciaPorId(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar comp');
  return await res.json();
}


// Crear una competencia (requiere token)
export async function crearCompetencia(data, token) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear competencia');
  }
  return res.json();
}

// Actualizar una competencia (requiere token)
export async function actualizarCompetencia(id, data, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar competencia');
  }
  return res.json();
}

// Eliminar una competencia (requiere token)
export async function eliminarCompetencia(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar competencia');
  }
  return res.json();
}
