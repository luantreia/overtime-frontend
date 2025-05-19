// src/components/common/BotonEditar.js
import React from 'react';
import { useAuth } from '../../context/Authcontext';

function BotonEditar({ onClick }) {
  const { rol } = useAuth();

  if (rol !== 'admin') return null;  // Solo admins ven el botón

  return (
    <button onClick={onClick} style={styles.botonEditar}>✎ Editar</button>
  );
}

const styles = {
  botonEditar: {
    padding: '6px 12px',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
  }
};

export default BotonEditar;
