import React from 'react';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';

export default function SeccionEquiposJugador({ jugadorId }) {
  const { relaciones, loading } = useJugadorEquipo({ jugadorId });

  return (
    <section style={styles.seccion}>
      <h3>Equipo/s</h3>
      {loading ? (
        <p>Cargando equipos...</p>
      ) : relaciones.length === 0 ? (
        <p>Este jugador no pertenece a ningún equipo actualmente.</p>
      ) : (
        <ul>
          {relaciones.map((rel) => (
            <h2 key={rel._id}>
              {rel.equipo?.nombre || 'Equipo sin nombre'}
              {rel.posicion && <> – <strong>{rel.posicion}</strong></>}
            </h2>
          ))}
        </ul>
      )}
    </section>
  );
}

const styles = {
  seccion: {
    backgroundColor: 'var(--color-secundario)',
    borderRadius: '12px',
    padding: '15px',
    marginTop: '10px',
  },
};
