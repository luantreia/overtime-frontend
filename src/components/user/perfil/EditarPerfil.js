import React, { useState } from 'react';

export default function EditarPerfil({ datos, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(datos.nombre || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({ nombre });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h2>Editar Perfil</h2>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancelar} style={{ marginLeft: 10 }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
