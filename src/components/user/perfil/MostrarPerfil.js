import React from 'react';
import Button from '../../common/FormComponents/Button';

export default function MostrarPerfil({ datos, onEditar, onEliminar }) {
  return (
      <div className='perfil-wrapper'>
        <h2>Mi Perfil</h2>
        <p><strong>Nombre:</strong> {datos.nombre}</p>
        <p><strong>Email:</strong> {datos.email}</p>
        <p><strong>Rol:</strong> {datos.rol}</p>

        <Button onClick={onEditar} variant='primary'>Editar perfil</Button>
        <Button onClick={onEliminar} variant='danger'>
            Eliminar cuenta
        </Button>
      </div>
  );
}
