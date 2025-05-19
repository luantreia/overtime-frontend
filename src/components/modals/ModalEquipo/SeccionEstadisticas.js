// components/modals/ModalEquipo/SeccionEstadisticas.js
import React from 'react';

export default function SeccionEstadisticas({ copas, puntos, racha }) {
  return (
    <div style={styles.seccion}>
      <h3>Estadísticas</h3>
      <p><span role="img" aria-label="copas">🏆</span> Copas: {copas || 0}</p>
      <p><span role="img" aria-label="puntos">💥</span> Puntos: {puntos || 0}</p>
      <p><span role="img" aria-label="fuego">🔥</span> Racha: {racha || 'N/A'}</p>
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
  }
};
