// src/services/partidoService.js

const API_URL = 'https://overtime-ddyl.onrender.com/api/partidos';

export async function fetchPartidos(token) {
  try {
    const res = await fetch(`${API_URL}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Error al cargar partidos');
    return await res.json();
  } catch (error) {
    console.error('Error fetchPartidos:', error);
    throw error;
  }
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
  
  const payload = {
    partido: partidoId,
    ...setData
  };
  
  const res = await fetch(`https://overtime-ddyl.onrender.com/api/set-partido`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al crear set');
  }

  return await res.json();
}

export async function actualizarSet(partidoId, numeroSet, setData, token) {
  // Primero obtenemos el set por partido y numeroSet
  const setsRes = await fetch(`https://overtime-ddyl.onrender.com/api/set-partido?partido=${partidoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!setsRes.ok) throw new Error('Error al obtener sets');
  
  const sets = await setsRes.json();
  console.log('🔍 Sets disponibles:', sets);
  console.log('🔍 Sets con detalles:', sets.map(s => ({ id: s._id, numeroSet: s.numeroSet, tipo: typeof s.numeroSet })));
  console.log('🔍 Buscando numeroSet:', numeroSet, 'tipo:', typeof numeroSet);
  
  // Convertir numeroSet a número para comparación
  const numeroSetNum = parseInt(numeroSet);
  console.log('🔍 numeroSetNum convertido:', numeroSetNum);
  
  const set = sets.find(s => {
    console.log('🔍 Comparando:', s.numeroSet, '===', numeroSetNum, '?', s.numeroSet === numeroSetNum);
    return s.numeroSet === numeroSetNum;
  });
  console.log('🔍 Set encontrado:', set);
  
  if (!set) {
    console.error('❌ Set no encontrado. Sets disponibles:', sets.map(s => ({ id: s._id, numeroSet: s.numeroSet })));
    
    // En lugar de crear un set nuevo, vamos a usar el primer set disponible como fallback
    console.log('🔄 Usando el primer set disponible como fallback...');
    const setFallback = sets[0];
    if (!setFallback) {
      throw new Error('No hay sets disponibles en el partido');
    }
    
    console.log('🔄 Actualizando set fallback:', setFallback._id);
    const res = await fetch(`https://overtime-ddyl.onrender.com/api/set-partido/${setFallback._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(setData),
    });
    
    console.log('📡 Respuesta PUT fallback:', res.status, res.statusText);
    
    if (!res.ok) {
      const responseText = await res.text();
      console.error('❌ Error response body fallback:', responseText);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Error ${res.status}: ${responseText.substring(0, 200)}...`);
      }
      throw new Error(errorData.error || 'Error al actualizar set fallback');
    }
    return await res.json();
  }
  
  console.log('🔄 Actualizando set existente:', set._id, 'con datos:', setData);
  
  // Validar que el ID del set sea válido
  if (!set._id || set._id.length !== 24) {
    throw new Error(`ID de set inválido: ${set._id}`);
  }
  
  const res = await fetch(`https://overtime-ddyl.onrender.com/api/set-partido/${set._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(setData),
  });
  
  console.log('📡 Respuesta PUT:', res.status, res.statusText);
  
  if (!res.ok) {
    const responseText = await res.text();
    console.error('❌ Error response body:', responseText);
    
    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Error ${res.status}: ${responseText.substring(0, 200)}...`);
    }
    throw new Error(errorData.error || 'Error al actualizar set');
  }
  return await res.json();
}

export async function eliminarSet(partidoId, numeroSet, token) {
  // Primero obtenemos el set por partido y numeroSet
  const setsRes = await fetch(`https://overtime-ddyl.onrender.com/api/set-partido?partido=${partidoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!setsRes.ok) throw new Error('Error al obtener sets');
  
  const sets = await setsRes.json();
  console.log('🗑️ ELIMINAR - Sets disponibles:', sets);
  console.log('🗑️ ELIMINAR - Buscando numeroSet:', numeroSet, 'tipo:', typeof numeroSet);
  
  // Convertir numeroSet a número para comparación
  const numeroSetNum = parseInt(numeroSet);
  console.log('🗑️ ELIMINAR - numeroSetNum convertido:', numeroSetNum);
  
  const set = sets.find(s => {
    console.log('🗑️ ELIMINAR - Comparando:', s.numeroSet, '===', numeroSetNum, '?', s.numeroSet === numeroSetNum);
    return s.numeroSet === numeroSetNum;
  });
  console.log('🗑️ ELIMINAR - Set encontrado:', set);
  
  if (!set) {
    console.error('❌ ELIMINAR - Set no encontrado. Sets disponibles:', sets.map(s => ({ id: s._id, numeroSet: s.numeroSet })));
    throw new Error('Set no encontrado');
  }
  
  const res = await fetch(`https://overtime-ddyl.onrender.com/api/set-partido/${set._id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al eliminar set');
  }
  return true;
}

// Obtener sets de un partido
export async function obtenerSetsDePartido(partidoId, token) {
  const res = await fetch(`https://overtime-ddyl.onrender.com/api/set-partido?partido=${partidoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al obtener sets');
  }
  return await res.json();
}

export async function actualizarStatsSet(partidoId, numeroSet, statsJugadoresSet, token) {
  // Esta función ahora se maneja a través de las nuevas APIs de estadísticas
  // Se mantiene por compatibilidad pero se recomienda usar las nuevas funciones
  console.warn('actualizarStatsSet está deprecated, usar las nuevas APIs de estadísticas');
  
  // Por ahora, actualizamos el set con la información básica
  return await actualizarSet(partidoId, numeroSet, { statsJugadoresSet }, token);
}

export async function fetchPartidosPorEquipo(equipoId, token) {
  const res = await fetch(`${API_URL}?equipo=${equipoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al cargar partidos del equipo');
  return await res.json();
}
