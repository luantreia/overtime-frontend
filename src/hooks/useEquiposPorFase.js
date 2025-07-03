// src/hooks/useEquiposPorFase.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://overtime-ddyl.onrender.com/api';

export function useEquiposPorFase(faseId) {
  const { token } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!faseId) return;

    const fetchEquipos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/equipos-competencia?fase=${faseId}`);
        if (!res.ok) throw new Error('Error al cargar equipos por fase');
        const data = await res.json();
        // Opcional: orden por puntos descendente
        const ordenados = data.sort((a, b) => b.puntos - a.puntos || b.diferenciaPuntos - a.diferenciaPuntos);
        setEquipos(ordenados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, [faseId]);

  return { equipos, loading, error };
}
