// src/components/common/Tarjetajugador.js
import React from 'react';

export default function TarjetaJugador({
  id,
  nombre,
  nacionalidad,
  edad,
  foto,
  onClick,
}) {
  const tieneFoto = foto && foto.trim() !== '';

  return (
    <div
      className="relative w-36 h-60 m-1 rounded-lg overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-in-out bg-white flex flex-col justify-end
                 hover:scale-105 hover:shadow-2xl" // Añadimos efectos hover para un toque extra
      onClick={onClick}
    >
      {tieneFoto ? (
        <img
          src={foto}
          alt={nombre}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-600 flex items-center justify-center z-10">
          <span className="text-6xl text-white font-bold">{nombre[0]}</span>
        </div>
      )}

      <div className="relative z-20 bg-black bg-opacity-60 text-white p-3 text-center rounded-b-lg">
        <h3 className="m-0 text-lg font-bold drop-shadow-md">{nombre}</h3>
        {nacionalidad && <p className="m-0 text-sm font-medium italic text-gray-300 drop-shadow-sm">{nacionalidad}</p>}
        {edad != null && <p className="m-0 text-sm font-medium text-gray-400 drop-shadow-sm">{edad} años</p>}
      </div>
    </div>
  );
}
