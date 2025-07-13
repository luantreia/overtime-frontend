import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function SeccionEquiposJugador({ jugadorId }) {
  const { token } = useAuth();
  const [relaciones, setRelaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jugadorId) return;

    async function cargarRelaciones() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?jugador=${jugadorId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Error ${res.status} al obtener contratos`);
        }

        const data = await res.json();
        setRelaciones(data);
      } catch (err) {
        setError(err.message);
        setRelaciones([]);
      } finally {
        setLoading(false);
      }
    }

    cargarRelaciones();
  }, [jugadorId, token]);

  if (loading) return <p className="text-gray-600">Cargando equipos...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (relaciones.length === 0)
    return <p className="text-gray-600">No se encontró ningún equipo</p>;

  return (
    <section className="bg-gray-100 rounded-xl p-4 mt-2.5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Equipo/s</h3>
      <ul className="list-disc pl-5 space-y-1">
        {relaciones.map((rel) => (
          <li key={rel._id} className="text-gray-700">
            <span className="font-medium">{rel.equipo?.nombre || 'Equipo sin nombre'}</span>
            {rel.posicion && <span className="font-bold"> – {rel.posicion}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
