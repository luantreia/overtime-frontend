// hooks/useFetchJugadores.js
import { useState, useEffect } from 'react';

export function useFetchJugadores(equipoId) {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!equipoId) return;

    setLoading(true);
    fetch(`https://overtime-ddyl.onrender.com/api/jugadores/por-equipo/${equipoId}`)
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
