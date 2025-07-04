import { useState, useEffect } from 'react';

const API_URL = 'https://overtime-ddyl.onrender.com/api/jugador-equipo';

export function useJugadorEquipo({ equipoId, jugadorId, token } = {}) {
  const [relaciones, setRelaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar relaciones con filtros
  useEffect(() => {
    if ((!equipoId && !jugadorId) || !token) {
      setRelaciones([]);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (equipoId) params.append('equipo', equipoId);
    if (jugadorId) params.append('jugador', jugadorId);
    params.append('activo', 'true');

    const fetchRelaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Error al obtener relaciones');
        const data = await res.json();
        setRelaciones(data);
      } catch (err) {
        console.error('❌ Error al obtener relaciones:', err);
        setError(err);
        setRelaciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelaciones();
  }, [equipoId, jugadorId, token]);

  // Asociar jugador a equipo
  const asociarJugador = async ({ jugador, equipo }) => {
    if (!token) throw new Error('Token no disponible');
    try {
      const res = await fetch(`${API_URL}/asociar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jugador, equipo }),
      });

      if (!res.ok) throw new Error('Error al asociar jugador');

      const nuevaRelacion = await res.json();
      setRelaciones(prev => [...prev, nuevaRelacion]);
      return nuevaRelacion;
    } catch (err) {
      console.error('❌ Error al asociar jugador:', err);
      setError(err);
      throw err;
    }
  };

  // Editar relación
  const actualizarRelacion = async (id, datos) => {
    if (!token) throw new Error('Token no disponible');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar la relación');
      }

      const actualizada = await res.json();
      setRelaciones(prev => prev.map(rel => (rel._id === id ? actualizada : rel)));
      return actualizada;
    } catch (err) {
      console.error('❌ Error al actualizar relación:', err);
      setError(err);
      throw err;
    }
  };

  // Eliminar relación
  const eliminarRelacion = async (id) => {
    if (!token) throw new Error('Token no disponible');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar la relación');

      setRelaciones(prev => prev.filter(rel => rel._id !== id));
    } catch (err) {
      console.error('❌ Error al eliminar relación:', err);
      setError(err);
      throw err;
    }
  };

  return {
    relaciones,
    loading,
    error,
    asociarJugador,
    actualizarRelacion,
    eliminarRelacion,
  };
}
