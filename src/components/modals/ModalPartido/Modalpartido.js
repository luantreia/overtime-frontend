import React, { useState, useEffect } from 'react';
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

  // This function is defined but not used in the provided JSX.
  // Consider removing if not needed or add logic to use it.
  // const eliminarSetLocal = (numeroSet) => {
  //   setSetsLocales(prevSets => prevSets.filter(s => s.numeroSet !== numeroSet));
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-4"> {/* Overlay */}
      <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl"> {/* Modal Content */}
        <CloseButton onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 text-3xl" /> {/* Adjusted CloseButton position and size */}

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Detalles del Partido</h2> {/* Title styling */}

        <div className="space-y-6 mb-6"> {/* Container for main partido details */}
          <PartidoDatosGenerales partido={partido} />
          <PartidoSetsLineaDeTiempo
            sets={partido.sets}
            equipoLocal={partido.equipoLocal}
            equipoVisitante={partido.equipoVisitante}
            jugadores={jugadores}
          />
        </div>
      </div>
    </div>
  );
}