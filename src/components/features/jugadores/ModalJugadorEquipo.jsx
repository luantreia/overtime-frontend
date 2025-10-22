// src/components/features/jugadores/ModalJugadorEquipo.jsx
import React from 'react';
import ModalLayout from '../../common/ModalLayout';
import { Button } from '../../ui';

const ModalJugadorEquipo = ({ relacion, onClose, onJugadorActualizado }) => {
  if (!relacion) return null;

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Relación Jugador-Equipo
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Jugador
            </label>
            <p className="text-gray-900 dark:text-white">
              {relacion.jugador?.nombre} {relacion.jugador?.apellido}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Equipo
            </label>
            <p className="text-gray-900 dark:text-white">
              {relacion.equipo?.nombre}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Posición
            </label>
            <p className="text-gray-900 dark:text-white">
              {relacion.posicion || 'No especificada'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <p className="text-gray-900 dark:text-white">
              {relacion.activa ? 'Activa' : 'Inactiva'}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={() => {
            // Aquí iría la lógica de edición
            onJugadorActualizado?.();
          }}>
            Editar
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default ModalJugadorEquipo;
