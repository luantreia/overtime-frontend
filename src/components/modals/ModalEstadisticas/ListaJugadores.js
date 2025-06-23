import React from 'react';
import JugadorEstadisticasCard from './JugadorEstadisticasCard';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';

export function ListaJugadores({
  equipoNombre,
  equipoId,
  estadisticasJugador = [],
  onAsignarJugador,
  onCambiarEstadistica
}) {
  const { relaciones, loading } = useJugadorEquipo({ equipoId });

  // Opciones del select con jugadores activos
  const opcionesSelect = relaciones
    .map(rel => ({
      value: rel.jugador?._id,
      label: rel.jugador?.nombre || 'Sin nombre',
    }))
    .filter(opt => Boolean(opt.value));

  // Jugadores ya asignados (excepto el actual)
  const obtenerJugadoresSeleccionados = (excluirIndex) =>
    estadisticasJugador
      .filter((_, i) => i !== excluirIndex)
      .map(j => j.jugadorId)
      .filter(Boolean);

  // Rellenamos hasta 6 filas por equipo, con placeholders si faltan
  const estadisticasCompletas = [
    ...estadisticasJugador,
    ...Array.from({ length: 6 - estadisticasJugador.length }).fill(null)
  ].slice(0, 6); // asegura que no haya más de 6

  if (loading) {
    return (
      <div className="equipo-container">
        <h3>{equipoNombre}</h3>
        <p>Cargando jugadores...</p>
      </div>
    );
  }

  return (
    <div className="equipo-container">
      <h3>{equipoNombre}</h3>
      <div className="jugadores-grid">
        {estadisticasCompletas.map((jugadorObj, idx) => {
          const jugadorId = jugadorObj?.jugadorId || '';
          const stats = jugadorObj?.estadisticas || {};

          const jugadoresSeleccionados = obtenerJugadoresSeleccionados(idx);

          const opcionesFiltradas = opcionesSelect.filter(
            (op) => !jugadoresSeleccionados.includes(op.value) || op.value === jugadorId
          );

          return (
            <JugadorEstadisticasCard
              key={`jugador-estadisticas-${idx}`}
              index={idx}
              jugadorId={jugadorId}
              opcionesJugadores={opcionesFiltradas}
              onCambiarJugador={(nuevoJugadorId) => onAsignarJugador(idx, nuevoJugadorId)}
              onCambiarEstadistica={(campo, delta) => onCambiarEstadistica(jugadorId, campo, delta)}
              estadisticasJugador={stats}
            />
          );
        })}
      </div>
    </div>
  );
}
