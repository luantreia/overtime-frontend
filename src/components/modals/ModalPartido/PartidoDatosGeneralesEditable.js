import React, { useState } from 'react';

export default function PartidoDatosGeneralesEditable({ datosIniciales, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(datosIniciales);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(datos);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha:
        </label>
        <input
          type="date"
          name="fecha"
          value={datos.fecha?.slice(0, 10) || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación:
        </label>
        <input
          type="text"
          name="ubicacion"
          value={datos.ubicacion || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado:
        </label>
        <select
          name="estado"
          value={datos.estado || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar</option>
          <option value="pendiente">Pendiente</option>
          <option value="jugado">Jugado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="flex gap-3 mt-4 justify-end">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
