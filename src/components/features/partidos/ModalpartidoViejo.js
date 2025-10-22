import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import PartidoDatosGenerales from './PartidoDatosGenerales';
import useJugadores from '../../../hooks/jugadores/useJugadores';
import CloseButton from '../../ui/FormComponents/CloseButton';
import PartidoSetsLineaDeTiempo from './PartidoSetsLineaDeTiempo';

export default function ModalPartido({
  partido,
  onClose,
  token,
}) {
  const { jugadores } = useJugadores(token);

  if (!partido) return null;

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b pb-3 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200">
            Detalles del Partido
          </h2>
          <CloseButton
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 text-2xl sm:text-3xl"
          />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <PartidoDatosGenerales partido={partido} />
          <PartidoSetsLineaDeTiempo
            sets={partido.sets}
            equipoLocal={partido.equipoLocal}
            equipoVisitante={partido.equipoVisitante}
            jugadores={jugadores}
          />
        </div>
      </div>
    </ModalLayout>
  );
}