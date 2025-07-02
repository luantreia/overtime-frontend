import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function useResumenEstadisticasEquipo(equipoId) {
  const { token } = useAuth;
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!equipoId) return;

    const fetchResumen = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/equipo/${equipoId}/resumen`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Error response (no JSON):', text);
          throw new Error(`Error al cargar resumen: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setResumen(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, [equipoId, token]);

  return { resumen, loading, error };
}