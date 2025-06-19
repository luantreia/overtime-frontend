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
      <div
        className="overlay"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="form">
        <h3 className="text">Editar equipo</h3>
          <InputText
            placeholder="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          <InputText
            placeholder="Escudo (URL)"
            name="escudo"
            value={formData.escudo}
            onChange={handleChange}
          />
          <InputText
            placeholder="Foto (URL)"
            name="foto"
            value={formData.foto}
            onChange={handleChange}
          />
          <div>
            <Button type="submit" variant = 'primary'>Guardar</Button>
            <Button type="button" variant = 'danger' onClick={onCancelar}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
  );
}

export default EditarEquipo;
