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

  const opcionesSelect = relaciones.map(rel => ({
    value: rel.jugador?._id,
    label: rel.jugador?.nombre || 'Sin nombre',
  })).filter(opt => opt.value); // Asegura que haya jugador

  return (
    <div className="equipo-container">
      <h3>{equipoNombre}</h3>
      {loading ? (
        <p>Cargando jugadores...</p>
      ) : (
        <div className="jugadores-grid">
          {Array.from({ length: 6 }).map((_, idx) => {
            const jugadorObj = estadisticasJugador[idx] || {};
            const jugadorId = jugadorObj.jugadorId || '';
            const stats = jugadorObj.estadisticas || {};

            // jugadores ya seleccionados en otras filas (excluye el actual)
            const jugadoresSeleccionados = estadisticasJugador
              .filter((_, i) => i !== idx)
              .map(j => j.jugadorId)
              .filter(Boolean); // saca los vacíos

            // filtrar opciones: mostrar solo jugadores no seleccionados o el propio
            const opcionesFiltradas = opcionesSelect.filter(
              (op) => !jugadoresSeleccionados.includes(op.value) || op.value === jugadorId
            );
            return (
            <JugadorEstadisticasCard
              key={jugadorId || `row-${idx}`}
              index={idx}
              jugadorId={jugadorId}
              opcionesJugadores={opcionesFiltradas}
              onCambiarJugador={(jugadorId) => onAsignarJugador(idx, jugadorId)}
              onCambiarEstadistica={(campo, delta) => onCambiarEstadistica(jugadorId, campo, delta)}
              estadisticasJugador={stats}
            />
            );
          })}
        </div>
      )}
    </div>
  );
}
