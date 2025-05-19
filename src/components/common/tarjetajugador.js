// src/components/common/TarjetaJugador.js
import React from 'react';

export default function TarjetaJugador({
  id,
  nombre,
  equipo,
  posicion,
  edad,
  foto,
  expandido,
  onExpand,
  onEditar
}) {
  const tieneFoto = foto && foto.trim() !== '';

  return (
    <div
      style={{ ...styles.card, ...(expandido ? styles.expanded : {}) }}
      onClick={onEditar}
    >
      {tieneFoto ? (
        <img src={foto} alt={nombre} style={styles.imagen} />
      ) : (
        <div style={styles.placeholder}>
          <span style={styles.inicial}>{nombre[0]}</span>
        </div>
      )}

      <div style={styles.overlay} onClick={e => e.stopPropagation()}>
        <h3>{nombre}</h3>
        {expandido && (
          <>
            <p><strong>Equipo:</strong> {equipo}</p>
            <p><strong>Posición:</strong> {posicion}</p>
            <p><strong>Edad:</strong> {edad}</p>
            <button onClick={onEditar} style={styles.botonEditar}>
              mas
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: '140px',
    height: '240px',
    position: 'relative',
    margin: '10px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
  },
  expanded: {
    width: '280px',
    height: '480px',
  },
  imagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  inicial: {
    fontSize: '48px',
    color: 'var(--color-fondo)',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'var(--color-fondo)',
    textAlign: 'center',
  },
  botonEditar: {
    marginTop: '6px',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};