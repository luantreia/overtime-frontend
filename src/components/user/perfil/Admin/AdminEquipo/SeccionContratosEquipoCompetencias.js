import React, { useEffect, useState } from 'react';
import SolicitudesContratoEquipoCompetencia from '../SolicitudesContratoEquipoCompetencia';

export default function SeccionContratosEquipoCompetencias({ equipoId, token, usuarioId }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API = 'https://overtime-ddyl.onrender.com/api';

  // Cargar vínculos actuales del equipo con competencias
  const cargarParticipaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/equipos-competencia?equipo=${equipoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar competencias del equipo');
      const data = await res.json();
      setParticipaciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (equipoId && token) {
      cargarParticipaciones();
    }
  }, [equipoId, token]);

  return (
    <section className="mb-6">
      <h4 className="text-lg font-semibold mb-2">Competencias del Equipo</h4>

      {loading && <p>Cargando competencias...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && participaciones.length === 0 && (
        <p className="text-gray-600">Este equipo no está asociado a ninguna competencia.</p>
      )}

      {!loading && participaciones.length > 0 && (
        <ul className="border rounded max-h-64 overflow-auto divide-y mb-4">
          {participaciones.map((ec) => (
            <li key={ec._id} className="p-2">
              <strong>{ec.competencia?.nombre}</strong>
              {ec.nombreAlternativo && (
                <span className="ml-2 text-sm text-gray-600">
                  (nombre alternativo: {ec.nombreAlternativo})
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      
    </section>
  );
}
