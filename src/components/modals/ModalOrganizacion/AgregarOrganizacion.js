import React, { useState } from 'react';
import { useOrganizaciones } from '../../../hooks/useOrganizaciones';

export default function AgregarOrganizacion() {
  const { agregarOrganizacion } = useOrganizaciones();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito(false);

    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      await agregarOrganizacion({ nombre, descripcion });
      setExito(true);
      setNombre('');
      setDescripcion('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Crear nueva organización</h2>
      {error && <p className="text-red-600">{error}</p>}
      {exito && <p className="text-green-600">Organización creada con éxito.</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Nombre</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-semibold">Descripción</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear
        </button>
      </form>
    </div>
  );
}
