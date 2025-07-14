// src/components/admin/competencia/fase/SeccionJugadoresFase.js
import React, { useEffect, useState } from 'react';

export default function SeccionJugadoresFase({ fase, token }) {
  const [jugadores, setJugadores] = useState([]);
  const [error, setError] = useState(null);

  const cargarJugadores = async () => {
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/participaciones?fase=${fase._id}&competenciaId=${fase.competencia}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const jugadoresTotales = [];
      for (let p of data) {
        const equipoCompId = p.equipoCompetencia?._id || p.equipoCompetencia;
        const resJug = await fetch(
          `https://overtime-ddyl.onrender.com/api/jugador-competencia?equipoCompetencia=${equipoCompId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const dataJug = await resJug.json();
        jugadoresTotales.push(...dataJug);
      }
      setJugadores(jugadoresTotales);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    cargarJugadores();
  }, [fase]);

  return (
    <section>
      <h3 className="text-lg font-semibold mb-2">Jugadores Asociados</h3>
      {error && <p className="text-red-600">{error}</p>}
      {jugadores.length === 0 ? (
        <p className="text-gray-600">No hay jugadores cargados en los equipos de esta fase.</p>
      ) : (
        <ul className="max-h-48 overflow-auto border rounded">
          {jugadores.map((j) => (
            <li key={j._id} className="px-2 py-1 border-b last:border-b-0">
              {j.jugadorEquipo?.nombre || 'Jugador'} - #{j.dorsal || 's/n'}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
