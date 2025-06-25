import React from 'react';
import Button from '../../common/FormComponents/Button';

export default function MostrarPerfil({ datos, onEditar, onEliminar }) {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
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

        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onEditar}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Editar perfil
          </button>
          <button
            onClick={onEliminar}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar cuenta
          </button>
        </div>
    </div>
  );
}