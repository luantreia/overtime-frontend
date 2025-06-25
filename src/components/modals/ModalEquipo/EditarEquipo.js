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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4" onClick={onCancelar}>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Editar equipo</h3>
        
        <div className="space-y-4 mb-6">
          <InputText
            placeholder="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <InputText
            placeholder="Escudo (URL)"
            name="escudo"
            value={formData.escudo}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <InputText
            placeholder="Foto (URL)"
            name="foto"
            value={formData.foto}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            variant="primary"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Guardar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onCancelar}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditarEquipo;