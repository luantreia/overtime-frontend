// src/components/common/tarjetaequipo.js
import React from 'react';

const TarjetaEquipo = React.memo(function TarjetaEquipo({ nombre, onClick, escudo }) {
  const tieneEscudo = escudo && escudo.trim() !== '';

  return (
    <div
      className="relative w-full max-w-xs h-48 sm:h-60 m-0 rounded-lg overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-in-out bg-white flex flex-col justify-end
                 hover:scale-105 hover:shadow-2xl dark:bg-gray-800 dark:border dark:border-gray-600"
      onClick={onClick}
    >
      {tieneEscudo ? (
        <img
          src={escudo}
          alt={nombre}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-600 flex items-center justify-center z-10">
          <span className="text-4xl sm:text-6xl text-white font-bold">{nombre[0]}</span>
        </div>
      )}

      <div className="relative z-20 bg-black bg-opacity-60 text-white p-2 sm:p-3 text-center rounded-b-lg">
        <h3 className="m-0 text-sm sm:text-lg font-bold drop-shadow-md line-clamp-2">{nombre}</h3>
      </div>
    </div>
  );
});

export default TarjetaEquipo;