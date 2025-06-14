// hooks/useFetchJugadores.js
import { useState, useEffect } from 'react';

export function useFetchJugadores(equipoId) {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipoId) return;

    setLoading(true);
    fetch(`/api/jugadores?equipoId=${equipoId}`)
      .then(res => res.json())
      .then(data => {
        setJugadores(data);
        setLoading(false);
      })
      .catch(() => {
        setJugadores([]);
        setLoading(false);
      });
  }, [equipoId]);

  return { jugadores, loading };
}
