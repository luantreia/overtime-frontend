import React from 'react';
import { useAuth} from '../context/AuthContext';
import { useUserRole } from '../../hooks/useUserRole';

function BotonEditar({ onClick }) {
  const { rol } = useAuth();
  const { isAdmin } = useUserRole(rol);

  if (!isAdmin) return null;

  return <button onClick={onClick}>✎ Editar</button>;
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
