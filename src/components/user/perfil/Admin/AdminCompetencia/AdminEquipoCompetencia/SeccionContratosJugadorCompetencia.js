import React, { useEffect, useState } from 'react';

const ESTADOS = ['aceptado', 'suspendido'];

export default function SeccionContratosJugadorCompetencia({ equipoId, competenciaId, token }) {
  const [jugadoresCompetencia, setJugadoresCompetencia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('aceptado');

  useEffect(() => {
    if (!equipoId || !competenciaId || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://overtime-ddyl.onrender.com/api/jugador-competencia?competencia=${competenciaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error('Error al cargar contratos de jugadores');

        const data = await res.json();

        const contratosValidos = data.filter((jc) =>
          jc.jugadorTemporada && jc.participacionTemporada && jc.equipoCompetencia
        );

        setJugadoresCompetencia(contratosValidos);
      } catch (err) {
        console.error('Error cargando jugadores:', err);
        alert('No se pudieron cargar los jugadores de la competencia');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [equipoId, competenciaId, token]);

  const jugadoresFiltrados = jugadoresCompetencia.filter(
    (jc) => jc.estado === filtroEstado
  );

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Jugadores del equipo en la competencia</h3>

      <div className="mb-4">
        <label htmlFor="filtroEstado" className="mr-2 font-medium">
          Filtrar por estado:
        </label>
        <select
          id="filtroEstado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Cargando jugadores...</p>
      ) : jugadoresFiltrados.length === 0 ? (
        <p>No hay jugadores con estado "{filtroEstado}".</p>
      ) : (
        <ul className="divide-y">
          {jugadoresFiltrados.map((jc) => (
            <li key={jc._id} className="py-2 flex justify-between items-center">
              <div>
                <p className="font-medium">{jc.jugador?.nombre || 'Sin nombre'}</p>
                <p className="text-sm text-gray-500 italic">{jc.estado}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
