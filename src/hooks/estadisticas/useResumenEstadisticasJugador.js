import { useState, useEffect } from 'react';

export default function useResumenEstadisticasJugador(jugadorId, token) {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jugadorId) return;

    const fetchResumen = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador/${jugadorId}/resumen`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Si no es OK, leemos el texto (podría ser HTML de error)
        if (!response.ok) {
          const text = await response.text();
          console.error('Error response (no JSON):', text);
          throw new Error(`Error al cargar resumen: ${response.status} ${response.statusText}`);
        }

        // Si OK, parseamos JSON normalmente
        const data = await response.json();
        setResumen(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, [jugadorId, token]);

  return { resumen, loading, error };
}
