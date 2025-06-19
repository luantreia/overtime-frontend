import React from 'react';
import JugadorEstadisticasCard from './JugadorEstadisticasCard';
import { useFetchJugadores } from '../../../hooks/useFetchJugadores';

export function TablaEstadisticas({ equipoNombre, equipoId, estadisticasJugador = [], onAsignarJugador, onCambiarEstadistica }) {
  const { jugadores, loading } = useFetchJugadores(equipoId);

  const opcionesSelect = jugadores
    .map(j => ({
      value: j._id,
      label: j.nombre || 'Sin nombre',
    }))
    .filter(opt => opt.value);

  return (
    <div>
      <h3>{equipoNombre}</h3>
      {loading && <p>Cargando jugadores...</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px' }}>Jugador</th>
            <th>Throws</th>
            <th>Hits</th>
            <th>Outs</th>
            <th>Catches</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, idx) => {
            const jugadorObj = estadisticasJugador[idx] || {};
            const jugadorId = jugadorObj.jugadorId || '';
            const stats = jugadorObj.estadisticas || { throws: 0, hits: 0, outs: 0, catches: 0 };

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
        </tbody>
      </table>
    </div>
  );
}
