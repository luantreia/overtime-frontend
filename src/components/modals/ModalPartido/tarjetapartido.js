
import React from 'react';

function TarjetaPartido({partido, equipos}) {
    const nombresEquipos = partido.equipos
    .map(id => {
      const equipo = equipos.find(e => e.id === id);
      return equipo ? equipo.nombre : "Equipo desconocido";
    })
    .join(', ');

  return (
    <div style={styles.card}>
      <div style={styles.overlay}>
        <h3>{partido.nombre}</h3>
        <div >
          <p><strong>Fecha:</strong> {partido.fecha}</p>
          <p><strong>Fecha de inicio:</strong> {partido.fechaInicio}</p>
          <p><strong>Equipos:</strong> {nombresEquipos}</p>
        </div>
       </div> 
    </div>
  );
}
const styles = {
  card: {
    width: '260px',        // antes: 200px
    height: '260px',
    position: 'relative',
    margin: '10px',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    cursor: 'pointer', // El cursor se convierte en puntero para indicar que se puede hacer clic

  },
  imagen: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
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

export default TarjetaPartido;
