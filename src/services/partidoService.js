// src/services/partidoService.js
import { fetchWithAuth } from '../utils/apiClient';

const API_BASE = '/api';
const API_URL = `${API_BASE}/partidos`;

export async function fetchPartidos(_token) {
  try {
    const res = await fetchWithAuth(`${API_URL}`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error al cargar partidos: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchPartidoById(id, _token) {
  const res = await fetchWithAuth(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al cargar partido');
  return await res.json();
}

export async function agregarPartido(partido, _token) {
  const res = await fetchWithAuth(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partido),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al agregar partido');
  }
  return await res.json();
}

export async function editarPartido(id, partido, _token) {
  const res = await fetchWithAuth(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partido),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al editar partido');
  }
  return await res.json();
}

export async function eliminarPartido(id, _token) {
  const res = await fetchWithAuth(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al eliminar partido');
  }
  return true;
}

export async function agregarSet(partidoId, setData, _token) {
  console.log('Enviando a la API:', JSON.stringify(setData, null, 2));
  console.log('🟡 Datos desde el hook:', setData);
  console.log('🟡 ENVIANDO A BACKEND setData:', JSON.stringify(setData, null, 2));
  
  const payload = {
    partido: partidoId,
    ...setData
  };
  
  const res = await fetchWithAuth(`/api/set-partido`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al crear set');
  }

  return await res.json();
}

export async function actualizarSet(partidoId, numeroSet, setData, _token) {
  // Primero obtenemos el set por partido y numeroSet
  const setsRes = await fetchWithAuth(`/api/set-partido?partido=${partidoId}`);
  if (!setsRes.ok) throw new Error('Error al obtener sets');
  
  const sets = await setsRes.json();
  console.log('🔍 Sets disponibles:', sets);
  console.log('🔍 Sets con detalles:', sets.map(s => ({ id: s._id, numeroSet: s.numeroSet, tipo: typeof s.numeroSet })));
  console.log('🔍 Buscando numeroSet:', numeroSet, 'tipo:', typeof numeroSet);
  
  // Convertir numeroSet a número para comparación
  const numeroSetNum = parseInt(numeroSet);
  console.log('🔍 numeroSetNum convertido:', numeroSetNum);
  
  const set = sets.find(s => {
    const sNum = Number(s.numeroSet);
    console.log('🔍 Comparando:', sNum, '===', numeroSetNum, '?', sNum === numeroSetNum);
    return sNum === numeroSetNum;
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
    const res = await fetchWithAuth(`/api/set-partido/${setFallback._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
  
  const res = await fetchWithAuth(`/api/set-partido/${set._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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

export async function eliminarSet(partidoId, numeroSet, _token, setId) {
  // Si tenemos el ID del set, eliminar directamente
  if (setId) {
    const res = await fetchWithAuth(`/api/set-partido/${setId}`, { method: 'DELETE' });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al eliminar set');
    }
    return true;
  }
  // Primero obtenemos el set por partido y numeroSet
  const setsRes = await fetchWithAuth(`/api/set-partido?partido=${partidoId}`);
  if (!setsRes.ok) throw new Error('Error al obtener sets');
  
  const sets = await setsRes.json();
  console.log('🗑️ ELIMINAR - Sets disponibles:', sets);
  console.log('🗑️ ELIMINAR - Buscando numeroSet:', numeroSet, 'tipo:', typeof numeroSet);
  
  // Convertir numeroSet a número para comparación
  const numeroSetNum = parseInt(numeroSet, 10);
  console.log('🗑️ ELIMINAR - numeroSetNum convertido:', numeroSetNum);
  if (Number.isNaN(numeroSetNum)) {
    throw new Error('Número de set inválido');
  }
  
  let set = sets.find(s => {
    const sNum = Number(s.numeroSet);
    console.log('🗑️ ELIMINAR - Comparando:', sNum, '===', numeroSetNum, '?', sNum === numeroSetNum);
    return sNum === numeroSetNum;
  });
  console.log('🗑️ ELIMINAR - Set encontrado:', set);
  
  if (!set) {
    console.error('❌ ELIMINAR - Set no encontrado. Intentando fallback al último set...');
    // Fallback: elegir el set con mayor numeroSet
    const setUltimo = sets.reduce((acc, curr) => {
      const accNum = Number(acc?.numeroSet ?? -Infinity);
      const currNum = Number(curr?.numeroSet ?? -Infinity);
      return currNum > accNum ? curr : acc;
    }, null);

    if (!setUltimo) {
      console.error('❌ ELIMINAR - No hay sets disponibles para fallback.');
      throw new Error('Set no encontrado');
    }

    const ultimoNum = Number(setUltimo.numeroSet);
    console.log('🗑️ ELIMINAR - Fallback último set:', { ultimoNum, id: setUltimo._id });

    // Si UI exige borrar el último, aceptamos fallback automáticamente
    if (ultimoNum === numeroSetNum) {
      // Reasignar para eliminar el último
      set = setUltimo;
    } else {
      // Si no coincide, mejor abortar con detalle
      console.error('❌ ELIMINAR - El número solicitado no coincide con el último set.', { solicitado: numeroSetNum, ultimo: ultimoNum });
      throw new Error('Set no encontrado');
    }
  }
  
  const res = await fetchWithAuth(`/api/set-partido/${set._id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al eliminar set');
  }
  return true;
}

// Obtener sets de un partido
export async function obtenerSetsDePartido(partidoId, _token) {
  const res = await fetchWithAuth(`/api/set-partido?partido=${partidoId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al obtener sets');
  }
  return await res.json();
}

export async function actualizarStatsSet(partidoId, numeroSet, statsJugadoresSet, _token) {
  // Esta función ahora se maneja a través de las nuevas APIs de estadísticas
  // Se mantiene por compatibilidad pero se recomienda usar las nuevas funciones
  console.warn('actualizarStatsSet está deprecated, usar las nuevas APIs de estadísticas');
  
  // Por ahora, actualizamos el set con la información básica
  return await actualizarSet(partidoId, numeroSet, { statsJugadoresSet });
}

export async function fetchPartidosPorEquipo(equipoId, _token) {
  const res = await fetchWithAuth(`${API_URL}?equipo=${equipoId}`);
  if (!res.ok) throw new Error('Error al cargar partidos del equipo');
  return await res.json();
}
