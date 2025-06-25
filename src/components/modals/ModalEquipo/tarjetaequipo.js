// src/components/common/tarjetaequipo.js
import React from 'react';

export default function TarjetaEquipo({ nombre, onClick, escudo }) {
  const tieneEscudo = escudo && escudo.trim() !== '';

  return (
    <div
      className="relative w-36 h-60 m-0 rounded-lg overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-in-out bg-white flex flex-col justify-end
                 hover:scale-105 hover:shadow-2xl" // Consistent hover effects
      onClick={onClick}
    >
      {tieneEscudo ? (
        <img
          src={escudo}
          alt={nombre}
          className="absolute inset-0 w-full h-full object-cover z-10" // Similar image styling
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-600 flex items-center justify-center z-10"> {/* Placeholder background color adjusted to match example's primary/gray-600 vibe */}
          <span className="text-6xl text-white font-bold">{nombre[0]}</span> {/* Initial text styling */}
        </div>
      )}

      <div className="relative z-20 bg-black bg-opacity-60 text-white p-3 text-center rounded-b-lg"> {/* Overlay styling similar to TarjetaJugador */}
        <h3 className="m-0 text-lg font-bold drop-shadow-md">{nombre}</h3> {/* Text styling for name */}
      </div>
    </div>
  );
}