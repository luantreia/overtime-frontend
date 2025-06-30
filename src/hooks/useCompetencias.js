import { useState, useEffect } from 'react';
import {
  obtenerCompetencias,
  obtenerCompetenciaPorId,
  crearCompetencia,
  actualizarCompetencia,
  eliminarCompetencia,
} from '../services/competenciaService';
import { useAuth } from '../context/AuthContext';

export function useCompetencias() {
  const [competencias, setCompetencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const cargarCompetencias = async () => {
    try {
      setLoading(true);
      const data = await obtenerCompetencias();
      setCompetencias(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar competencias');
    } finally {
      setLoading(false);
    }
  };

  const agregarCompetencia = async (nuevaComp) => {
    try {
      const data = await crearCompetencia(nuevaComp, token);
      setCompetencias((prev) => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err.message || 'Error al crear competencia');
    }
  };

  const eliminarCompetenciaPorId = async (id) => {
    try {
      await eliminarCompetencia(id, token);
      setCompetencias((prev) => prev.filter((comp) => comp._id !== id));
    } catch (err) {
      throw new Error(err.message || 'Error al eliminar competencia');
    }
  };

  const actualizarCompetenciaPorId = async (id, datos) => {
    try {
      const actualizada = await actualizarCompetencia(id, datos, token);
      setCompetencias((prev) =>
        prev.map((comp) => (comp._id === id ? actualizada : comp))
      );
      return actualizada;
    } catch (err) {
      throw new Error(err.message || 'Error al actualizar competencia');
    }
  };

  return {
    competencias,
    loading,
    error,
    cargarCompetencias,
    agregarCompetencia,
    eliminarCompetenciaPorId,
    actualizarCompetenciaPorId,
  };
}

export function useCompetenciaPorId(id) {
  const [competencia, setCompetencia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const cargarCompetencia = async () => {
    try {
      setLoading(true);
      const data = await obtenerCompetenciaPorId(id, token);
      setCompetencia(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar competencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) cargarCompetencia();
  }, [id]);

  return {
    competencia,
    loading,
    error,
    refetch: cargarCompetencia,
  };
}
