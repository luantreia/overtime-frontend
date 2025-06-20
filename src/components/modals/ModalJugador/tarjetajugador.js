// src/components/common/Tarjetajugador.js
import React from 'react';

export default function TarjetaJugador({
  id,
  nombre,
  nacionalidad,
  edad,
  foto,
  onClick,
}) {
  const tieneFoto = foto && foto.trim() !== '';

  return (
    <div style={styles.card} onClick={onClick}>
      {tieneFoto ? (
        <img src={foto} alt={nombre} style={styles.imagen} />
      ) : (
        <div style={styles.placeholder}>
          <span style={styles.inicial}>{nombre[0]}</span>
        </div>
      )}

      <div style={styles.overlay}>
        <h3 style={styles.nombre}>{nombre}</h3>
        {nacionalidad && <p style={styles.nacionalidad}>{nacionalidad}</p>}
        {edad != null && <p style={styles.edad}>{edad} años</p>}
      </div>
    </div>
  );
}


const styles = {
  card: {
    width: '160px',
    height: '260px',
    position: 'relative',
    margin: '10px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    backgroundColor: 'var(--color-fondo)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  imagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#888',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  inicial: {
    fontSize: '56px',
    color: 'var(--color-fondo)',
  },
  overlay: {
    position: 'relative',
    zIndex: 2,
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'var(--color-fondo)',
    padding: '12px',
    textAlign: 'center',
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px',
  },
  nombre: {
    margin: '0 0 4px',
    fontSize: '18px',
    fontWeight: '700',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
  },
  nacionalidad: {
    margin: '0 0 2px',
    fontSize: '14px',
    fontWeight: '500',
    fontStyle: 'italic',
    color: '#ddd',
    textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
  },
  edad: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '500',
    color: '#ccc',
    textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
  },
};
