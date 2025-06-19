import React from 'react';
import JugadorEstadisticasCard from './JugadorEstadisticasCard';
import { useFetchJugadores } from '../../../hooks/useFetchJugadores';

export function ListaJugadores({ equipoNombre, equipoId, estadisticasJugador = [], onAsignarJugador, onCambiarEstadistica }) {
  const { jugadores, loading } = useFetchJugadores(equipoId);

  const opcionesSelect = jugadores.map(j => ({
    value: j._id,
    label: j.nombre || 'Sin nombre',
  }));

  return (
    <div className="equipo-container">
      <h3>{equipoNombre}</h3>
      {loading ? <p>Cargando jugadores...</p> : (
        <div className="jugadores-grid">
          {Array.from({ length: 6 }).map((_, idx) => {
            const jugadorObj = estadisticasJugador[idx] || {};
            const jugadorId = jugadorObj.jugadorId || '';
            const stats = jugadorObj.estadisticas || {};

            return (
              <JugadorEstadisticasCard
                key={idx}
                index={idx}
                jugadorId={jugadorId}
                opcionesJugadores={opcionesSelect}
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
