import React, { useEffect, useState } from 'react';

export default function SeccionContratosEquiposCompetencia({ competenciaId, token, usuarioId }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API = 'https://overtime-ddyl.onrender.com/api';

  const cargarEquiposCompetencia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/equipos-competencia?competencia=${competenciaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al cargar equipos');
      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (competenciaId && token) {
      cargarEquiposCompetencia();
    }
  }, [competenciaId, token]);

  return (
    <section className="mb-6">
      <h4 className="text-lg font-semibold mb-2">Equipos en la Competencia</h4>

      {loading && <p>Cargando equipos...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && equipos.length === 0 && (
        <p className="text-gray-600">No hay equipos asociados a esta competencia.</p>
      )}

      {!loading && equipos.length > 0 && (
        <ul className="border rounded max-h-64 overflow-auto divide-y mb-4">
          {equipos.map((ec) => (
            <li key={ec._id} className="p-2">
              <strong>{ec.equipo?.nombre}</strong>
              {ec.nombreAlternativo && (
                <span className="ml-2 text-sm text-gray-600">(alias: {ec.nombreAlternativo})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
