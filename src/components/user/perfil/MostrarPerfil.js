// src/components/user/perfil/MostrarPerfil.js

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';

export default function MostrarPerfil({ datos, onEditar, onEliminar }) {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const esAdmin = datos?.rol === "admin";

  const toggleMenu = () => setMenuAbierto(prev => !prev);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md relative">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Mi Perfil</h2>

      <p className="text-lg text-gray-700">
        <strong className="font-semibold text-gray-800">Nombre:</strong> {datos.nombre}
      </p>
      <p className="text-lg text-gray-700">
        <strong className="font-semibold text-gray-800">Email:</strong> {datos.email}
      </p>
      <p className="text-lg text-gray-700">
        <strong className="font-semibold text-gray-800">Rol:</strong> {datos.rol}
      </p>

      {/* Botón de configuración */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleMenu}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
          aria-label="Configuraciones"
        >
          <FiSettings size={24} />
        </button>

        {menuAbierto && (
          <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                onEditar();
                cerrarMenu();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
            >
              Editar perfil
            </button>
            <button
              onClick={() => {
                onEliminar();
                cerrarMenu();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            >
              Eliminar cuenta
            </button>
            
              <button
                onClick={() => {
                  navigate('/admin');
                  cerrarMenu();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-green-700"
              >
                Panel de administración
              </button>
            
          </div>
        )}
      </div>
    </div>
  );
}
