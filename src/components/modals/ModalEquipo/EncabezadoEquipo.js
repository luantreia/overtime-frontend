import React from 'react';
import Button from '../../common/FormComponents/Button';
import useUserRole from '../../../hooks/useUserRole';

export default function EncabezadoEquipo({ equipo, onEditar }) {
  const { uid } = useUserRole(); // ✅ Aquí obtenés el uid
  const esAdmin = equipo.administradores?.includes(uid);

  return (
    <div style={styles.encabezado}>
      <img src={equipo.escudo || equipo.foto} alt="Escudo" style={styles.escudo} />
      <h2>{equipo.nombre}</h2>
      {esAdmin && (
        <Button type="button" color="secondary" onClick={onEditar}>✎ Editar</Button>
      )}
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
