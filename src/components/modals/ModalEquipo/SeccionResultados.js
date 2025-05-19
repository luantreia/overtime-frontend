// components/modals/ModalEquipo/SeccionResultados.js
import React from 'react';

export default function SeccionResultados({ resultados }) {
  return (
    <div style={styles.seccion}>
      <h3>Últimos Resultados</h3>
      <ul>
        {resultados?.length > 0 ? (
          resultados.map((r, i) => <li key={i}>{r}</li>)
        ) : (
          <li>Sin datos</li>
        )}
      </ul>
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
