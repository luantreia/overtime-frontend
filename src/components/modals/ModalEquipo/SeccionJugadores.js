// components/modals/ModalEquipo/SeccionJugadores.js
import React from 'react';
import TarjetaJugador from '../ModalJugador/tarjetajugador';

export default function SeccionJugadores({ loading, jugadores, setModalJugador }) {
  return (
    <div style={styles.seccion}>
      <h3>Jugadores</h3>
      {loading ? (
        <p>Cargando jugadores...</p>
      ) : jugadores.length > 0 ? (
        <div style={styles.jugadoresGrid}>
          {jugadores.map((jugador) => (
            <TarjetaJugador
              key={jugador._id || jugador.nombre}
              jugador={jugador}
              nombre={jugador.nombre}
              equipo={jugador.equipo}
              posicion={jugador.posicion}
              foto={jugador.foto}
              onClick={() => setModalJugador(jugador)}
            />
          ))}
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
