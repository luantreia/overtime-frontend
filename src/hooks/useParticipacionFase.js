import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useParticipacionFase() {
  const { token } = useAuth();
  const [participaciones, setParticipaciones] = useState([]);
  const [participacion, setParticipacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'https://overtime-ddyl.onrender.com/api/participaciones';

  // Memoizamos fetchParticipaciones para que no cambie en cada render
  const fetchParticipaciones = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(filtros).toString();
      const res = await fetch(`${API_URL}?${query}`);
      if (!res.ok) throw new Error('Error al obtener participaciones');
      const data = await res.json();
      setParticipaciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // El resto igual...

  const fetchParticipacionPorId = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('Error al obtener participación');
      const data = await res.json();
      setParticipacion(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const crearParticipacion = useCallback(async ({ equipoCompetencia, fase, grupo, division }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ equipoCompetencia, fase, grupo, division }),
      });
      if (!res.ok) throw new Error('Error al crear participación');
      const data = await res.json();
      setParticipaciones(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const actualizarParticipacion = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Error al actualizar participación');
      const actualizada = await res.json();
      setParticipaciones(prev =>
        prev.map(p => (p._id === actualizada._id ? actualizada : p))
      );
      return actualizada;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const eliminarParticipacion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al eliminar participación');
      setParticipaciones(prev => prev.filter(p => p._id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    participaciones,
    participacion,
    loading,
    error,
    fetchParticipaciones,
    fetchParticipacionPorId,
    crearParticipacion,
    actualizarParticipacion,
    eliminarParticipacion,
  };
}
