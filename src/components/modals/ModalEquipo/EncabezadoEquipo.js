// components/modals/ModalEquipo/EncabezadoEquipo.js
import React from 'react';
import BotonEditar from '../../common/BotonEditar';

export default function EncabezadoEquipo({ equipo, onEditar }) {

  return (
    <div style={styles.encabezado}>
      <img src={equipo.escudo || equipo.foto} alt="Escudo" style={styles.escudo} />
      <h2>{equipo.nombre}</h2>
      <button onClick={onEditar}>✎ Editar</button>
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
};
