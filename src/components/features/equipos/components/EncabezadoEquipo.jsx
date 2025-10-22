// src/components/features/equipos/components/EncabezadoEquipo.jsx
import React from 'react';

/**
 * Componente EncabezadoEquipo mejorado con diseño moderno
 */
const EncabezadoEquipo = ({ equipo, compact = false }) => {
  const tieneEscudo = equipo?.escudo || equipo?.foto;

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        {tieneEscudo ? (
          <img
            src={equipo.escudo || equipo.foto}
            alt={`Escudo de ${equipo.nombre}`}
            className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full object-cover border-2 border-gray-200 dark:border-gray-700`}
          />
        ) : (
          <div className={`rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
            <span className={`font-bold text-gray-600 dark:text-gray-300 ${compact ? 'text-lg' : 'text-2xl'}`}>
              {equipo?.nombre?.[0] || '?'}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-gray-900 dark:text-white truncate`}>
          {equipo?.nombre || 'Equipo sin nombre'}
        </h2>
        {equipo?.pais && (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {equipo.pais}
          </p>
        )}
      </div>
    </div>
  );
};

export default EncabezadoEquipo;
