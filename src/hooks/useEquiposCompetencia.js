import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://overtime-ddyl.onrender.com/api';

export function useEquipoCompetencia(competenciaId) {
  const { token } = useAuth(); // Aquí tomas el token desde contexto
  
  const [equiposCompetencia, setEquiposCompetencia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEquipos = useCallback(async () => {
    if (!competenciaId) return;

    setLoading(true);
    setError(null);

    try {
        const headers = {};
        const res = await fetch(`${API_URL}/equipos-competencia?competencia=${competenciaId}`, {
            headers,
        });
      if (!res.ok) throw new Error('Error cargando equipos');
      const data = await res.json();
      setEquiposCompetencia(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [competenciaId, token]);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  const agregarEquipo = async (equipoId) => {
    if (!competenciaId || !equipoId) throw new Error('Falta competenciaId o equipoId');
    if (!token) throw new Error('No hay token disponible');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/equipos-competencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ competencia: competenciaId, equipo: equipoId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error agregando equipo');
      }
      const nuevoEquipo = await res.json();
      setEquiposCompetencia((prev) => [...prev, nuevoEquipo]);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarEquipoCompetencia = async (id) => {
    if (!id) throw new Error('Falta id de equipoCompetencia');
    if (!token) throw new Error('No hay token disponible');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/equipos-competencia/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error eliminando equipo');
      }
      setEquiposCompetencia((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editarEquipoCompetencia = async (id, data) => {
    if (!id || !token) throw new Error('Faltan datos o token');
    try {
      const res = await fetch(`${API_URL}/equipos-competencia/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error actualizando equipo');
      }
      const actualizado = await res.json();
      setEquiposCompetencia((prev) =>
        prev.map((eq) => (eq._id === id ? actualizado : eq))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    equiposCompetencia,
    loading,
    error,
    agregarEquipo,
    eliminarEquipoCompetencia,
    editarEquipoCompetencia,
  };
}
