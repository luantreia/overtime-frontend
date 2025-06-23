// src/components/modals/ModalEstadisticasCaptura/EquiposEstadisticas.js
import React from 'react';
import { ListaJugadores } from './ListaJugadores.js';

export default function EquiposEstadisticas({ equipoLocal, equipoVisitante, estadisticas, onCambiarEstadistica, onAsignarJugador }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      gap: 40,
      marginTop: 25,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    }}>
      <ListaJugadores 
        equipoNombre={equipoLocal.nombre} 
        equipoId={equipoLocal._id} 
        estadisticasJugador={estadisticas.local} 
        onCambiarEstadistica={onCambiarEstadistica} 
        onAsignarJugador={(index, jugadorId) => onAsignarJugador('local', index, jugadorId)}
      />
      <ListaJugadores
        equipoNombre={equipoVisitante.nombre} 
        equipoId={equipoVisitante._id} 
        estadisticasJugador={estadisticas.visitante} 
        onCambiarEstadistica={onCambiarEstadistica} 
        onAsignarJugador={(index, jugadorId) => onAsignarJugador('visitante', index, jugadorId)}
      />
    </div>
  );
}
