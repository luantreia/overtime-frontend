// components/modals/ModalEquipo/EncabezadoEquipo.js
import React from 'react';
import BotonEditar from '../../common/BotonEditar';
import { useAuth } from '../../context/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';

export default function EncabezadoEquipo({ equipo, onEditar }) {
  const { rol } = useAuth();
  const { isAdmin } = useUserRole(rol);

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
};
