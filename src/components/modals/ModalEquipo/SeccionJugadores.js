// src/components/modals/ModalEquipo/SeccionJugadores.js
import React from 'react';
import TarjetaJugador from '../ModalJugador/tarjetajugador';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';

export default function SeccionJugadores({ equipoId, setModalJugador }) {
  const { relaciones, loading } = useJugadorEquipo({equipoId});

  return (
    <div style={styles.seccion}>
      <h3>Jugadores asignados</h3>
      {loading ? (
        <p>Cargando jugadores...</p>
      ) : relaciones.length > 0 ? (
        <div style={styles.jugadoresGrid}>
          {relaciones.map((rel) => {
            const jugador = rel.jugador;
            if (!jugador) return null; // Evita errores de render

            return (
              <TarjetaJugador
                key={jugador._id}
                jugador={jugador}
                nombre={jugador.nombre}
                equipo={rel.equipo?.nombre}
                posicion={jugador.posicion}
                foto={jugador.foto}
                onClick={() => setModalJugador(jugador)}
              />
            );
          })}
        </div>
      ) : (
        <p>Sin jugadores asignados</p>
      )}
    </div>
  );
}


const styles = {
  seccion: {
    flex: '1 1 250px',
    backgroundColor: "var(--color-fondo-secundario)",
    padding: '10px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  jugadoresGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
  }
};
