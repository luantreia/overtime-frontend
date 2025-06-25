import React, { useState } from 'react';
import { getAuth, getIdToken } from 'firebase/auth';
import InputText from '../../common/FormComponents/InputText';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';
import Button from '../../common/FormComponents/Button';

export default function EditarJugador({ jugador, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: jugador.nombre || '',
    alias: jugador.alias || '',
    foto: jugador.foto || '',
    fechaNacimiento: jugador.fechaNacimiento ? jugador.fechaNacimiento.slice(0, 10) : '',
    genero: jugador.genero || 'otro',
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

      const payload = {
        nombre: formData.nombre,
        alias: formData.alias,
        foto: formData.foto,
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
      };

      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/jugadores/${jugador._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
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
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Editar jugador</h3>

        <div className="space-y-4 mb-6">
          <InputText
            placeholder="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <InputText
            placeholder="Alias"
            name="alias"
            value={formData.alias}
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

          <InputText
            type="date"
            placeholder="Fecha de nacimiento"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <SelectDropdown
            placeholder="Género"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            options={[
              { label: 'Masculino', value: 'masculino' },
              { label: 'Femenino', value: 'femenino' },
              { label: 'Otro', value: 'otro' },
            ]}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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