import React, { useEffect } from 'react';
import { useParticipacionFase } from '../../../../hooks/useParticipacionFase';

function SeccionTablaLiga({ faseId }) {
  const { participaciones, loading, error, fetchParticipaciones } = useParticipacionFase();

  useEffect(() => {
    if (faseId) fetchParticipaciones({ fase: faseId });
  }, [faseId]);

  if (loading) {
    return <p className="text-gray-500">Cargando tabla...</p>;
  }

  if (!participaciones.length) {
    return <p className="text-gray-500">No hay equipos en esta fase.</p>;
  }

  return (
    <section>
      <h3 className="text-xl font-semibold mb-3">Tabla de posiciones</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-sm">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2 text-left">Equipo</th>
              <th className="px-3 py-2">PJ</th>
              <th className="px-3 py-2">G</th>
              <th className="px-3 py-2">E</th>
              <th className="px-3 py-2">P</th>
              <th className="px-3 py-2">Pts</th>
              <th className="px-3 py-2">Dif</th>
            </tr>
          </thead>
          <tbody>
            {participaciones.map((eq, idx) => (
              <tr key={eq._id} className="text-center hover:bg-gray-100">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2 text-left">{eq.equipoCompetencia?.equipo?.nombre || 'Sin nombre'}</td>
                <td className="px-3 py-2">{eq.partidosJugados}</td>
                <td className="px-3 py-2">{eq.partidosGanados}</td>
                <td className="px-3 py-2">{eq.partidosEmpatados}</td>
                <td className="px-3 py-2">{eq.partidosPerdidos}</td>
                <td className="px-3 py-2 font-bold">{eq.puntos}</td>
                <td className="px-3 py-2">{eq.diferenciaPuntos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default SeccionTablaLiga;
