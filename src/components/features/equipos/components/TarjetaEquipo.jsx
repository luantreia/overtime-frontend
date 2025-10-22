// src/components/features/equipos/components/TarjetaEquipo.jsx
import React from 'react';

/**
 * Componente TarjetaEquipo reutilizable con diseño mejorado
 */
const TarjetaEquipo = React.memo(function TarjetaEquipo({
  nombre,
  onClick,
  escudo,
  className = '',
  size = 'md'
}) {
  const tieneEscudo = escudo && escudo.trim() !== '';

  const sizes = {
    sm: 'w-full max-w-xs h-40',
    md: 'w-full max-w-xs h-48 sm:h-60',
    lg: 'w-full max-w-sm h-56 sm:h-72'
  };

  const baseClasses = [
    'relative rounded-lg overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-in-out bg-white flex flex-col justify-end',
    'hover:scale-105 hover:shadow-2xl dark:bg-gray-800 dark:border dark:border-gray-600 dark:shadow-gray-900/50',
    sizes[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} onClick={onClick}>
      {tieneEscudo ? (
        <img
          src={escudo}
          alt={nombre}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center z-10">
          <span className="text-4xl sm:text-6xl text-white font-bold drop-shadow-lg">
            {nombre[0]}
          </span>
        </div>
      )}

      <div className="relative z-20 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-70 text-white p-2 sm:p-3 text-center rounded-b-lg backdrop-blur-sm">
        <h3 className="m-0 text-sm sm:text-lg font-bold drop-shadow-md line-clamp-2">
          {nombre}
        </h3>
      </div>
    </div>
  );
});

export default TarjetaEquipo;
