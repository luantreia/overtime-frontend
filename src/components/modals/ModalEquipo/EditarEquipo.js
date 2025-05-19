// src/components/modals/ModalEquipo/EditarEquipo.js
import React, { useState } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';
import InputText from '../../common/FormComponents/InputText';
import Button from '../../common/FormComponents/Button';

function EditarEquipo({ equipo, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: equipo.nombre || '',
    escudo: equipo.escudo || '',
    foto: equipo.foto || '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('Usuario no autenticado');
        return;
      }

      const idToken = await getIdToken(user);

      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/equipos/${equipo._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error('Error al guardar');

      const actualizado = await res.json();
      onGuardar(actualizado);
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
      <h3>Editar equipo</h3>
        <InputText
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        <InputText
          label="Escudo (URL)"
          name="escudo"
          value={formData.escudo}
          onChange={handleChange}
        />
        <InputText
          label="Foto (URL)"
          name="foto"
          value={formData.foto}
          onChange={handleChange}
        />
        <div className="flex gap-3 justify-end mt-4">
          <Button type="submit">Guardar</Button>
          <Button type="button" color="red" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditarEquipo;
