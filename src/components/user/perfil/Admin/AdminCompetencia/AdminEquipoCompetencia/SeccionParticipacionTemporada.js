import React, { useEffect, useState } from 'react';

export default function SeccionParticipacionTemporada({ equipoId, competenciaId, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarParticipaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-temporada?equipo=${equipoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar la participación');
      const data = await res.json();
      setParticipaciones(data);
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (equipoId && token) {
      cargarParticipaciones();
    }
  }, [equipoId, token]);

  if (loading) return <p>Cargando participaciones...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold">Participación en Temporadas</h3>
      {participaciones.length === 0 ? (
        <p className="text-gray-500">Este equipo no tiene participaciones registradas.</p>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {participaciones.map((p) => (
            <li key={p._id}>
              Temporada: <strong>{p.temporada?.nombre || 'Sin nombre'}</strong> – Estado: <em>{p.estado}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
