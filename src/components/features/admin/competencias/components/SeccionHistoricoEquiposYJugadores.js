import React, { useEffect, useState } from 'react';
import ModalEquipoCompetenciaAdmin from './AdminEquipoCompetencia/ModalEquipoCompetenciaAdmin';

const API = 'https://overtime-ddyl.onrender.com/api';

export default function SeccionHistoricoEquiposYJugadores({ competenciaId, token, usuarioId }) {
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (!competenciaId || !token) return;
    cargarDatos();
  }, [competenciaId, token]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      // 🔹 Equipos
      const resEquipos = await fetch(`${API}/equipos-competencia?competencia=${competenciaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resEquipos.ok) throw new Error('Error al cargar equipos');
      const dataEquipos = await resEquipos.json();
      const aceptados = dataEquipos.filter(e => e.estado === 'aceptado');
      setEquipos(aceptados);

      // 🔸 Jugadores
      const resJugadores = await fetch(`${API}/jugador-competencia?competencia=${competenciaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resJugadores.ok) throw new Error('Error al cargar jugadores');
      const dataJugadores = await resJugadores.json();
      setJugadores(dataJugadores);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (equipo) => {
    setEquipoSeleccionado(equipo);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEquipoSeleccionado(null);
  };

  return (
    <div className="space-y-8">
      <section>
        <h4 className="text-lg font-semibold mb-2">🟦 Equipos en la Competencia</h4>
        {loading ? (
          <p>Cargando equipos...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : equipos.length === 0 ? (
          <p className="text-gray-600">No hay equipos asociados a esta competencia.</p>
        ) : (
          <ul className="border rounded max-h-64 overflow-auto divide-y mb-4">
            {equipos.map(ec => (
              <li
                key={ec._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => abrirModal(ec)}
              >
                <strong>{ec.equipo?.nombre || 'Equipo sin nombre'}</strong>
                {ec.nombreAlternativo && (
                  <span className="ml-2 text-sm text-gray-600">(alias: {ec.nombreAlternativo})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="text-lg font-semibold mb-2">🟨 Jugadores en la Competencia</h4>
        {loading ? (
          <p>Cargando jugadores...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : jugadores.length === 0 ? (
          <p className="text-gray-600">No hay jugadores registrados en esta competencia.</p>
        ) : (
          <ul className="border rounded max-h-64 overflow-auto divide-y">
            {jugadores.map(jc => (
              <li key={jc._id} className="p-2">
                {jc.jugador?.nombre || 'Jugador sin nombre'} 
                {jc.jugadorTemporada?.equipoTemporada?.equipo?.nombre && (
                  <span className="ml-2 text-sm text-gray-600">
                    (Equipo: {jc.jugadorTemporada.equipoTemporada.equipo.nombre})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {mostrarModal && equipoSeleccionado && (
        <ModalEquipoCompetenciaAdmin
          competenciaId={competenciaId}
          equipoCompetencia={equipoSeleccionado}
          token={token}
          usuarioId={usuarioId}
          abierto={mostrarModal}
          onClose={cerrarModal}
        />
      )}
    </div>
  );
}
