import React, { useEffect, useState } from 'react';

export default function SeccionEquiposPartido({ partido, token }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  const api = `https://overtime-ddyl.onrender.com/api/equipo-partido?partido=${partido._id}`;

  useEffect(() => {
    fetch(api, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setEquipos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [partido._id, token]);

  if (loading) return <p>Cargando equipos...</p>;
  if (!equipos.length) return <p>No hay equipos asignados aún.</p>;

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Equipos en el partido</h4>
      <ul className="space-y-2">
        {equipos.map((e) => (
          <li key={e._id} className="p-2 bg-gray-100 rounded">
            <strong>{e.esLocal ? 'Local' : 'Visitante'}:</strong> {e.equipo?.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
