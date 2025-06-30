const API_URL = 'https://overtime-ddyl.onrender.com/api/fases';

function limpiarFaseParaGuardar(fase) {
  const faseFinal = { ...fase };

  if (faseFinal.tipo !== 'grupo') {
    delete faseFinal.numeroClasificados;
  }

  if (faseFinal.tipo !== 'liga') {
    delete faseFinal.division;
    delete faseFinal.numeroAscensos;
    delete faseFinal.numeroDescensos;
    delete faseFinal.superiorDirecta;
    delete faseFinal.inferiorDirecta;
  }
  Object.keys(faseFinal).forEach((key) => {
    if (faseFinal[key] === '') {
      delete faseFinal[key];
    }
  });
  return faseFinal;
}

export async function fetchFases(competenciaId) {
  const res = await fetch(`${API_URL}?competencia=${competenciaId}`);
  if (!res.ok) throw new Error('Error al cargar fases');
  
  return await res.json();
}

export async function crearFase(fase, token) {
  const faseLimpia = limpiarFaseParaGuardar(fase);

  console.log("📦 Fase a enviar (limpia):", JSON.stringify(faseLimpia, null, 2));

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(faseLimpia)
  });

  if (!res.ok) throw new Error('Error al crear fase');
  return await res.json();
}

export async function actualizarFase(id, fase, token) {
  const faseLimpia = limpiarFaseParaGuardar(fase);

  console.log("✏️ Fase actualizada (limpia):", JSON.stringify(faseLimpia, null, 2));

  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(faseLimpia)
  });

  if (!res.ok) throw new Error('Error al actualizar fase');
  return await res.json();
}

export async function eliminarFase(id, token) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Error al eliminar fase');
}
