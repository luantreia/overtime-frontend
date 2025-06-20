// src/components/common/TarjetaJugador.js
import React from 'react';

export default function tarjetaJugadorEquipo({ relacion, onClick }) {
  const jugador = relacion?.jugador;
  const equipo = relacion?.equipo;
  const tieneFoto = jugador?.foto?.trim() !== '';

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  return (
    <div style={styles.card} onClick={onClick}>
      {tieneFoto ? (
        <img src={jugador.foto} alt={jugador.nombre} style={styles.imagen} />
      ) : (
        <div style={styles.placeholder}>
          <span style={styles.inicial}>{jugador.nombre[0]}</span>
        </div>
      )}

      <div style={styles.overlay}>
        <h3>{jugador.nombre}</h3>
        <p style={styles.meta}>Edad: {calcularEdad(jugador.fechaNacimiento) || 'N/A'}</p>
        <p style={styles.meta}>Equipo: {equipo?.nombre || 'Sin equipo'}</p>
        <p style={styles.meta}>Rol: {relacion.rol || 'jugador'}</p>
        <p style={styles.meta}>Modalidad: {relacion.modalidad || '-'}</p>
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
  imagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#888',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: '6px 0',
  },
  edad: {
    fontSize: '14px',
    margin: '4px 0 0',
    color: '#ddd',
  },
};
