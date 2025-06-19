// src/hooks/useEstadisticas.js
import { useState, useEffect } from 'react';
import {
  fetchEstadisticasDePartido,
  guardarEstadistica
} from '../services/estadisticasService';

export function useEstadisticas(partidoId, token) {
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar las estadísticas de los sets del partido
  useEffect(() => {
    if (!partidoId || !token) return;

    setLoading(true);
    fetchEstadisticasDePartido(partidoId, token)
      .then(data => {
        setEstadisticas(data.sets);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [partidoId, token]);

  // Función para actualizar o guardar stats de un jugador
  const guardarStatsJugador = async (numeroSet, jugadorId, nuevaEstadistica) => {
    try {
      await guardarEstadistica(partidoId, numeroSet, jugadorId, nuevaEstadistica, token);
      // Refrescar las estadísticas localmente luego de guardar
      const data = await fetchEstadisticasDePartido(partidoId, token);
      setEstadisticas(data.sets);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    estadisticas,
    setEstadisticas,
    loading,
    error,
    guardarStatsJugador
  };
}
