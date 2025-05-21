import React from 'react';

export default function MostrarPerfil({ datos, onEditar, onEliminar }) {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h2>Mi Perfil</h2>
      <p><strong>Nombre:</strong> {datos.nombre}</p>
      <p><strong>Email:</strong> {datos.email}</p>
      <p><strong>Rol:</strong> {datos.rol}</p>

      <button onClick={onEditar}>Editar perfil</button>
      <button onClick={onEliminar} style={{ marginLeft: 10, color: 'red' }}>
        Eliminar cuenta
      </button>
    </div>
  );
}
