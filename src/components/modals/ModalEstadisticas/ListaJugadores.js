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

  const opcionesSelect = relaciones
    .map(rel => ({
      value: rel.jugador?._id,
      label: rel.jugador?.nombre || 'Sin nombre',
    }))
    .filter(opt => Boolean(opt.value));

  const obtenerJugadoresSeleccionados = (excluirIndex) =>
    estadisticasJugador
      .filter((_, i) => i !== excluirIndex)
      .map(j => j.jugadorId)
      .filter(Boolean);

  const estadisticasCompletas = [
    ...estadisticasJugador,
    ...Array.from({ length: 6 - estadisticasJugador.length }).fill(null)
  ].slice(0, 6);

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{equipoNombre}</h3>
        <p className="text-slate-500">Cargando jugadores...</p>
      </div>
    );
  }

  return (
    <div className="p-1">
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{equipoNombre}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4">
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
              onCambiarJugador={(nuevoId) => onAsignarJugador(idx, nuevoId)}
              onCambiarEstadistica={(campo, delta) => onCambiarEstadistica(jugadorId, campo, delta)}
              estadisticasJugador={stats}
            />
          );
        })}
      </div>
    </div>
  );
}
