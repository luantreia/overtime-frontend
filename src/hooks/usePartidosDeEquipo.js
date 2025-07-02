import { useState, useEffect } from 'react';
import { fetchPartidos } from '../services/partidoService';
import { useAuth } from '../context/AuthContext';

export function usePartidosDeEquipo(equipoId) {
  const { token } = useAuth(); // ⬅️ token viene del contexto
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !equipoId) return;

    setLoading(true);
    fetchPartidos(token)
      .then((todos) => {
        console.log('Partidos recibidos del backend:', todos);
        const filtrados = todos
            .filter(p =>
                (p.equipoLocal?._id || p.equipoLocal) === equipoId ||
                (p.equipoVisitante?._id || p.equipoVisitante) === equipoId
            )
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        console.log('Partidos del equipo:', filtrados);

        setPartidos(filtrados);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar partidos del equipo');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [equipoId, token]);

  return { partidos, loading, error };
}
