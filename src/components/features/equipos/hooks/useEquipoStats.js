// src/components/features/equipos/hooks/useEquipoStats.js
import { useState, useEffect } from 'react';
import { useApi } from '../../../../hooks/api/useApi';

/**
 * Hook personalizado para estadísticas de equipos
 */
export const useEquipoStats = (equipoId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { get } = useApi();

  const fetchStats = async () => {
    if (!equipoId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await get(`/api/equipos/${equipoId}/estadisticas`);
      setStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching equipo stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [equipoId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

export default useEquipoStats;
