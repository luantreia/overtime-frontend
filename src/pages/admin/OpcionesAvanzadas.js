// src/pages/admin/OpcionesAvanzadas.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUserPlus, FiSettings, FiUsers } from 'react-icons/fi';

export default function OpcionesAvanzadas() {
  const navigate = useNavigate();

  const opciones = [
    {
      titulo: 'Límites de creación por usuario',
      descripcion: 'Establece cuántos jugadores, equipos u otras entidades puede crear un usuario común.',
      icono: <FiUserPlus size={20} />,
      ruta: '/admin/opciones/limites'
    },
    {
      titulo: 'Transferencias de jugadores',
      descripcion: 'Permitir a usuarios ceder o intercambiar derechos de administración sobre jugadores.',
      icono: <FiUsers size={20} />,
      ruta: '/admin/opciones/transferencias'
    },
    {
      titulo: 'Solicitudes pendientes',
      descripcion: 'Gestioná las solicitudes de acceso o modificaciones hechas por los usuarios.',
      icono: <FiSettings size={20} />,
      ruta: '/admin/opciones/solicitudes'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Volver
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Opciones avanzadas</h1>

      <div className="grid sm:grid-cols-2 gap-6">
        {opciones.map((opcion) => (
          <div
            key={opcion.titulo}
            onClick={() => navigate(opcion.ruta)}
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg p-6 shadow transition duration-200"
          >
            <div className="flex items-center mb-2 text-slate-800">
              {opcion.icono}
              <h2 className="ml-2 text-xl font-semibold">{opcion.titulo}</h2>
            </div>
            <p className="text-gray-600 text-sm">{opcion.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
