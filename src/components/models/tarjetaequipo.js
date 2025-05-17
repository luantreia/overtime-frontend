
import React from 'react';


function TarjetaEquipo({ nombre, onClick, escudo }) {

  const tieneEscudo = escudo && escudo.trim() !== '';

  return (
    <div style={styles.card} onClick={onClick}>
      {tieneEscudo ? (
        <img src={escudo} alt={nombre} style={styles.imagen}  />
      ) : (
        <div style={styles.placeholder}>
          <span style={styles.inicial}>{nombre[0]}</span>
        </div>
      )}
      <div style={styles.overlay}>
      <h3>{nombre}</h3>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: '140px', 
    height: '240px',
    position: 'relative',
    margin: '5px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    cursor: 'pointer', // El cursor se convierte en puntero para indicar que se puede hacer clic
  },
  imagen: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--color-primario)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px'
  },
  inicial: {
    fontSize: '48px',
    color: 'var(--color-fondo)'
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    color: 'var(--color-fondo)',
    background: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    padding: '0px',
    textAlign: 'center',
  }
};

export default TarjetaEquipo;
