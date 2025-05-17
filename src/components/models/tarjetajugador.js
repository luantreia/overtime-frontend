import React, { useState } from 'react';

function TarjetaJugador({ nombre, equipo, posicion, edad, foto }) {
  // Establecemos el estado para controlar la expansión
  const [expandida, setExpandida] = useState(false);
  const tieneFoto = foto && foto.trim() !== '';
  // Función para alternar la expansión
  const toggleExpandida = () => {
    setExpandida(!expandida);
  };

  return (
    <div
      style={{ ...styles.card, ...(expandida ? styles.expanded : {}) }} // Si está expandida, cambiamos el estilo
      onClick={toggleExpandida} // Al hacer clic, alternamos el estado
    >
      {tieneFoto ? (
        <img src={foto} alt={nombre} style={styles.imagen}  />
      ) : (
        <div style={styles.placeholder}>
          <span style={styles.inicial}>{nombre[0]}</span>
        </div>
      )}
      <div style={styles.overlay}>
        <h3>{nombre}</h3>
        {expandida && (
          <div>
            <p><strong>Equipo:</strong> {equipo}</p>
            {/* Aquí mostramos información adicional cuando está expandida */}
            <p><strong>Posición:</strong> {posicion}</p>
            <p><strong>Edad:</strong> {edad}</p>
            <p><strong>Descripción:</strong> Jugador clave con gran desempeño.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: '140px',        // antes: 200px
    height: '240px',
    position: 'relative',
    margin: '10px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    cursor: 'pointer', // El cursor se convierte en puntero para indicar que se puede hacer clic
    transition: 'all 0.3s ease-in-out', // Animación suave al expandir
  },
  expanded: {
    width: '280px', // Aumentamos el tamaño de la tarjeta cuando se expande
    height: '480px', // Ajustamos la altura
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


export default TarjetaJugador;
