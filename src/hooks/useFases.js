// src/hooks/useFases.js
import { useState, useEffect } from 'react';
import {
  fetchFases,
  crearFase,
  actualizarFase,
  eliminarFase
} from '../services/faseService';
import { useAuth } from '../context/AuthContext';

export function useFases(competenciaId) {
  const { token } = useAuth();
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarFases = async () => {
    setLoading(true);
    try {
      const data = await fetchFases(competenciaId);
      setFases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregar = async (fase) => {
    const nueva = await crearFase(fase, token);
    setFases((prev) => [...prev, nueva]);
  };

  const editar = async (id, fase) => {
    const actualizada = await actualizarFase(id, fase, token);
    setFases((prev) => prev.map(f => f._id === id ? actualizada : f));
  };

  const eliminar = async (id) => {
    await eliminarFase(id, token);
    setFases((prev) => prev.filter(f => f._id !== id));
  };

  useEffect(() => {
    if (competenciaId) cargarFases();
  }, [competenciaId]);

  return {
    fases,
    loading,
    error,
    agregar,
    editar,
    eliminar,
    refetch: cargarFases
  };
}
