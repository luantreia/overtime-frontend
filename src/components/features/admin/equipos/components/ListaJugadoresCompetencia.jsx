import React, { useEffect, useState } from 'react';

// Componente que muestra jugadores de un equipo en una competencia específica
function ListaJugadoresCompetencia({ equipoCompetenciaId, token }) {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!equipoCompetenciaId || !token) return;

    const cargarJugadoresCompetencia = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://overtime-ddyl.onrender.com/api/jugador-competencia?equipoCompetencia=${equipoCompetenciaId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error('Error al cargar jugadores de la competencia');
        const data = await res.json();
        setJugadores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarJugadoresCompetencia();
  }, [equipoCompetenciaId, token]);

  if (loading) return <p>Cargando jugadores...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (jugadores.length === 0) return <p className="text-gray-600">No hay jugadores asociados a esta competencia.</p>;

  return (
    <ul className="mt-2 border rounded max-h-48 overflow-auto divide-y">
      {jugadores.map(jc => (
        <li key={jc._id} className="p-2">
          <strong>{jc.jugador?.nombre || 'Jugador desconocido'}</strong>
          {jc.rol && <span className="ml-2 text-sm text-gray-600">({jc.rol})</span>}
          {jc.numero && <span className="ml-2 text-sm text-gray-600">#{jc.numero}</span>}
        </li>
      ))}
    </ul>
  );
}

export default function SeccionContratosEquipoCompetencias({ equipoId, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [competenciaSeleccionadaId, setCompetenciaSeleccionadaId] = useState(null);

  const cargarCompetenciasDelEquipo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/equipos-competencia?equipo=${equipoId}`, {
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
      cargarCompetenciasDelEquipo();
      setCompetenciaSeleccionadaId(null); // resetear selección al cambiar equipo o token
    }
  }, [equipoId, token]);

  const toggleSeleccionCompetencia = id => {
    // Si se clickea la competencia ya seleccionada, la deselecciona (toggle)
    setCompetenciaSeleccionadaId(prev => (prev === id ? null : id));
  };

  return (
    <section className="mb-4">
      <h4 className="text-lg font-semibold mb-2">Competencias del Equipo</h4>
      {loading && <p>Cargando competencias...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && participaciones.length === 0 && (
        <p className="text-gray-600">Este equipo no está asociado a ninguna competencia.</p>
      )}
      {!loading && participaciones.length > 0 && (
        <ul className="border rounded max-h-64 overflow-auto divide-y">
          {participaciones.map(ec => (
            <li key={ec._id} className="p-2 cursor-pointer" onClick={() => toggleSeleccionCompetencia(ec._id)}>
              <div className="flex justify-between items-center">
                <div>
                  <strong>{ec.competencia?.nombre}</strong>
                  {ec.nombreAlternativo && (
                    <span className="ml-2 text-sm text-gray-600">(nombre alternativo: {ec.nombreAlternativo})</span>
                  )}
                </div>
                <div className="text-blue-600 text-sm select-none">
                  {competenciaSeleccionadaId === ec._id ? '▲' : '▼'}
                </div>
              </div>

              {/* Subcomponente de jugadores si está seleccionado */}
              {competenciaSeleccionadaId === ec._id && (
                <ListaJugadoresCompetencia equipoCompetenciaId={ec._id} token={token} />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
