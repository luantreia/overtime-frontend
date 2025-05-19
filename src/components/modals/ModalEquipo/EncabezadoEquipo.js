// components/modals/ModalEquipo/EncabezadoEquipo.js
import React from 'react';
import BotonEditar from '../../common/BotonEditar';

export default function EncabezadoEquipo({ equipo, onEditar }) {
  return (
    <div style={styles.encabezado}>
      <img src={equipo.escudo || equipo.foto} alt="Escudo" style={styles.escudo} />
      <h2>{equipo.nombre}</h2>
      {isAdmin && <BotonEditar onClick={onEditar} />}
    </div>
  );
}

const styles = {
  encabezado: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    marginBottom: '15px',
  },
  escudo: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  botonEditar: {
    padding: '6px 12px',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333'
  }
};
