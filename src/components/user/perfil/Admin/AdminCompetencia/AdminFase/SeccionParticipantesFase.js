// src/components/user/perfil/admin/competencia/fase/SeccionParticipantesFase.js

import React, { useEffect, useState } from 'react';

export default function SeccionParticipantesFase({ fase, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarParticipaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/participaciones?fase=${fase._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Error al cargar participantes');
      const data = await res.json();
      setParticipaciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fase?._id && token) cargarParticipaciones();
  }, [fase, token]);

  return (
    <section className="mb-4">
      <h4 className="text-lg font-semibold mb-2">Participantes</h4>

      {loading && <p>Cargando participantes...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && participaciones.length === 0 && (
        <p className="text-gray-600">No hay equipos asignados a esta fase.</p>
      )}

      {!loading && participaciones.length > 0 && (
        <ul className="border rounded max-h-60 overflow-auto">
          {participaciones.map((p) => (
            <li
              key={p._id}
              className="px-2 py-1 border-b last:border-b-0 hover:bg-gray-50"
            >
              <strong>{p.equipoCompetencia?.equipo?.nombre}</strong>{' '}
              {p.grupo && <span>- Grupo: {p.grupo}</span>}
              {p.division && <span> - División: {p.division}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
