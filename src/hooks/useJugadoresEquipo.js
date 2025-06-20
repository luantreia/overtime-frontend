import { useState, useEffect } from 'react';

export function useJugadorEquipo({ equipoId, jugadorId }) {
  const [relaciones, setRelaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No hacemos nada si no hay ningún filtro
    if (!equipoId && !jugadorId) {
      setRelaciones([]);
      setLoading(false);
      return;
    }

    const params = new URLSearchParams();
    if (equipoId) params.append('equipo', equipoId);
    if (jugadorId) params.append('jugador', jugadorId);
    params.append('activo', 'true'); // para traer solo activos, opcional

    const fetchRelaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?${params.toString()}`);
        const data = await res.json();
        setRelaciones(data);
      } catch (error) {
        console.error('Error al obtener relaciones jugador-equipo', error);
        setRelaciones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelaciones();
  }, [equipoId, jugadorId]);

  return { relaciones, loading };
}
