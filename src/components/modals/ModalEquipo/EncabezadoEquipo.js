import React from 'react';
import Button from '../../common/FormComponents/Button';
import { useAuth } from '../../../context/AuthContext';

export default function EncabezadoEquipo({ equipo, onEditar }) {
  const { user, rol } = useAuth(); // ✅ obtenés uid y rol del contexto
  const uid = user?.uid;

  const esAdminEquipo = equipo.administradores?.includes(uid);
  const esAdminGlobal = rol === 'admin';

  return (
    <div style={styles.encabezado}>
      <img src={equipo.escudo || equipo.foto} alt="Escudo" style={styles.escudo} />
      <h2>{equipo.nombre}</h2>
      {(esAdminEquipo || esAdminGlobal) && (
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
