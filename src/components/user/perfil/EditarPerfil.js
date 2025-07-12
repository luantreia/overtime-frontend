// src/components/user/perfil/EditarPerfil.js

import React, { useState } from 'react';
import Button from '../../common/FormComponents/Button'; // Ensure this path is correct

export default function EditarPerfil({ datos, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(datos.nombre || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({ nombre });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4" onClick={onCancelar}>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Editar Perfil</h2>
        
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button type="submit" variant="success" className="px-6 py-3">Guardar</Button>
          <Button type="button" onClick={onCancelar} variant="danger" className="px-6 py-3">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}