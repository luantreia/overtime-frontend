import React, { useEffect, useState } from 'react';

const ESTADOS = ['activo', 'pendiente', 'finalizado'];

export default function SeccionContratosJugadorCompetencia({ equipoId, competenciaId, token }) {
  const [jugadoresEquipo, setJugadoresEquipo] = useState([]);
  const [jugadoresCompetencia, setJugadoresCompetencia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('activo');

  // Función para obtener IDs relacionados necesarios para agregar JugadorCompetencia
  async function obtenerIdsRelacionados(jugadorId) {
    if (!jugadorId || !equipoId || !competenciaId || !token) return {};

    try {
      // Obtener vínculo JugadorEquipo activo
      const resJugadorEquipo = await fetch(
        `https://overtime-ddyl.onrender.com/api/jugador-equipo?jugador=${jugadorId}&equipo=${equipoId}&estado=aceptado`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resJugadorEquipo.ok) throw new Error('No se encontró vínculo jugador-equipo activo');
      const datosJugadorEquipo = await resJugadorEquipo.json();
      const jugadorEquipoId = datosJugadorEquipo[0]?._id;

      // Obtener vínculo EquipoCompetencia activo
      const resEquipoCompetencia = await fetch(
        `https://overtime-ddyl.onrender.com/api/equipo-competencia?equipo=${equipoId}&competencia=${competenciaId}&estado=aceptado`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resEquipoCompetencia.ok) throw new Error('No se encontró vínculo equipo-competencia activo');
      const datosEquipoCompetencia = await resEquipoCompetencia.json();
      const equipoCompetenciaId = datosEquipoCompetencia[0]?._id;

      return { jugadorEquipoId, equipoCompetenciaId };
    } catch (error) {
      console.error('Error obteniendo IDs relacionados:', error);
      return {};
    }
  }

  useEffect(() => {
    if (!equipoId || !competenciaId || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [resJugadoresEquipo, resJugadoresCompetencia] = await Promise.all([
          fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?equipo=${equipoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`https://overtime-ddyl.onrender.com/api/jugador-competencia?competencia=${competenciaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!resJugadoresEquipo.ok || !resJugadoresCompetencia.ok) {
          throw new Error('Error al cargar datos');
        }

        const jugadoresEquipoData = await resJugadoresEquipo.json();
        const jugadoresCompetenciaData = await resJugadoresCompetencia.json();

        setJugadoresEquipo(jugadoresEquipoData);
        setJugadoresCompetencia(jugadoresCompetenciaData);
      } catch (err) {
        console.error('Error cargando jugadores:', err);
        alert('No se pudieron cargar los datos de los jugadores');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [equipoId, competenciaId, token]);

  async function agregarJugadorCompetencia(jugadorId) {
    if (!jugadorId) return;

    try {
      const { jugadorEquipoId, equipoCompetenciaId } = await obtenerIdsRelacionados(jugadorId);

      if (!jugadorEquipoId || !equipoCompetenciaId) {
        alert('Faltan datos de contrato previos para poder vincular el jugador a la competencia.');
        return;
      }

      const payload = {
        jugador: jugadorId,
        equipo: equipoId,
        competencia: competenciaId,
        jugadorEquipo: jugadorEquipoId,
        equipoCompetencia: equipoCompetenciaId,
      };

      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-competencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const nuevo = await res.json();
      setJugadoresCompetencia((prev) => [...prev, nuevo]);
    } catch (error) {
      console.error('Error al agregar jugador:', error);
      alert('No se pudo agregar el jugador a la competencia.');
    }
  }

  // Filtrar jugadoresCompetencia según estado seleccionado
  const jugadoresCompetenciaFiltrados = jugadoresCompetencia.filter(
    (jc) => jc.estado === filtroEstado
  );

  // JugadoresEquipo que no están en jugadoresCompetencia (por id)
  const idsJugadoresCompetencia = new Set(
    jugadoresCompetencia.map((jc) => (jc.jugador?._id || jc.jugador))
  );

  const jugadoresDisponibles = jugadoresEquipo.filter((je) => {
    const jugadorId = je.jugador?._id || je.jugador;
    return !idsJugadoresCompetencia.has(jugadorId);
  });

  return (
    <div className="p-4 flex gap-6">
      {/* Columna Jugadores en Competencia */}
      <div className="w-1/2 border rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Jugadores en Competencia</h3>

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
          <p>Cargando...</p>
        ) : jugadoresCompetenciaFiltrados.length === 0 ? (
          <p>No hay jugadores con estado "{filtroEstado}".</p>
        ) : (
          <ul className="divide-y">
            {jugadoresCompetenciaFiltrados.map((jc) => {
              const jugador = jc.jugador;
              return (
                <li key={jc._id} className="py-1 flex justify-between items-center">
                  <span>{jugador?.nombre || 'Sin nombre'}</span>
                  <span className="italic text-sm text-gray-600">{jc.estado}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Columna Jugadores Disponibles */}
      <div className="w-1/2 border rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Jugadores disponibles en el equipo</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : jugadoresDisponibles.length === 0 ? (
          <p>No hay jugadores disponibles para agregar.</p>
        ) : (
          <ul className="divide-y">
            {jugadoresDisponibles.map((je) => {
              const jugadorId = je.jugador?._id || je.jugador;
              return (
                <li key={je._id} className="py-1 flex justify-between items-center">
                  <span>{je.jugador?.nombre || 'Sin nombre'}</span>
                  <button
                    onClick={() => agregarJugadorCompetencia(jugadorId)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
