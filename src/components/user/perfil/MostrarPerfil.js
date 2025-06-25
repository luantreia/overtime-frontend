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
          <Button
            onClick={onEditar}
            variant="primary"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Editar perfil
          </Button>
          <Button
            onClick={onEliminar}
            variant="danger"
            className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Eliminar cuenta
          </Button>
        </div>
    </div>
  );
}