import React from 'react';

export default function MostrarPerfil({ datos, onEditar, onEliminar }) {
  return (
    <div className='container'>
        <div className='overlay'>
        <h2>Mi Perfil</h2>
        <p><strong>Nombre:</strong> {datos.nombre}</p>
        <p><strong>Email:</strong> {datos.email}</p>
        <p><strong>Rol:</strong> {datos.rol}</p>

        <button onClick={onEditar}>Editar perfil</button>
        <button onClick={onEliminar} style={{ marginLeft: 10, color: 'red' }}>
            Eliminar cuenta
        </button>
        </div>
    </div>
  );
}
