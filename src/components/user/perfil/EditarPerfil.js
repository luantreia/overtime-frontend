import React, { useState } from 'react';
import Button from '../../common/FormComponents/Button';
export default function EditarPerfil({ datos, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(datos.nombre || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({ nombre });
  };

  return (
    <div className='perfil-wrapper'>
    <form onSubmit={handleSubmit} className='form'>
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
        <Button type="submit" variant='success'>Guardar</Button>
        <Button type="button" onClick={onCancelar} variant='danger'>
          Cancelar
        </Button>
      </div>
    </form>
    </div>
  );
}
