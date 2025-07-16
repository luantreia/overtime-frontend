import React, { useEffect, useState } from 'react';

export default function GestionParticipacionesFase({ fase, competenciaId, token }) {
  const [equipos, setEquipos] = useState([]);
  const [participaciones, setParticipaciones] = useState([]);
  const [grupoAsignado, setGrupoAsignado] = useState({});
  const [divisionAsignada, setDivisionAsignada] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fase?._id || !competenciaId || !token) return;

    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [resEquipos, resParticipaciones] = await Promise.all([
          fetch(`https://overtime-ddyl.onrender.com/api/equipos-competencia?competencia=${competenciaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`https://overtime-ddyl.onrender.com/api/participaciones?fase=${fase._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const equiposData = await resEquipos.json();
        const participacionesData = await resParticipaciones.json();

        setEquipos(equiposData);
        setParticipaciones(participacionesData);
      } catch (err) {
        setError('Error al cargar equipos o participaciones');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [fase, competenciaId, token]);

  const equiposAsignadosIds = participaciones.map(p => p.equipoCompetencia);
  const equiposDisponibles = equipos.filter(eq => !equiposAsignadosIds.includes(eq._id));

  const handleAgregar = async (eqId) => {
    setLoading(true);
    setError(null);

    const payload = {
      equipoCompetencia: eqId,
      fase: fase._id,
    };

    if (fase.tipo === 'grupo') {
      const grupo = grupoAsignado[eqId]?.trim();
      if (!grupo) {
        setError('Debe asignar un grupo');
        setLoading(false);
        return;
      }
      payload.grupo = grupo;
    }

    if (fase.tipo === 'liga') {
      const division = divisionAsignada[eqId]?.trim();
      if (!division) {
        setError('Debe asignar una división');
        setLoading(false);
        return;
      }
      payload.division = division;
    }

    try {
      const res = await fetch('https://overtime-ddyl.onrender.com/api/participaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al agregar participación');

      setParticipaciones(prev => [...prev, data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Equipos en esta fase</h3>

      {participaciones.length === 0 ? (
        <p className="text-gray-500">No hay equipos asignados aún.</p>
      ) : (
        <ul className="mb-4 space-y-1">
          {participaciones.map((p) => (
            <li key={p._id} className="border rounded p-2 bg-gray-50">
              {p.equipoCompetencia?.equipo?.nombre || 'Equipo'}{' '}
              {fase.tipo === 'grupo' && p.grupo && <span>- Grupo {p.grupo}</span>}
              {fase.tipo === 'liga' && p.division && <span>- División {p.division}</span>}
            </li>
          ))}
        </ul>
      )}

      <h4 className="text-md font-medium mt-4 mb-2">Agregar equipo a esta fase</h4>

      {equiposDisponibles.length === 0 ? (
        <p className="text-gray-400">No hay equipos disponibles para agregar.</p>
      ) : (
        <div className="space-y-2">
          {equiposDisponibles.map((eq) => (
            <div key={eq._id} className="flex items-center gap-3 border p-2 rounded bg-white shadow-sm">
              <span className="flex-1">{eq.equipo?.nombre}</span>

              {fase.tipo === 'grupo' && (
                <input
                  placeholder="Grupo"
                  className="input w-24"
                  value={grupoAsignado[eq._id] || ''}
                  onChange={(e) =>
                    setGrupoAsignado({ ...grupoAsignado, [eq._id]: e.target.value })
                  }
                />
              )}

              {fase.tipo === 'liga' && (
                <input
                  placeholder="División"
                  className="input w-24"
                  value={divisionAsignada[eq._id] || ''}
                  onChange={(e) =>
                    setDivisionAsignada({ ...divisionAsignada, [eq._id]: e.target.value })
                  }
                />
              )}

              <button
                onClick={() => handleAgregar(eq._id)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                disabled={loading}
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
