import React from 'react';

export default function TarjetaCompetencia({ nombre, descripcion, onClick }) {
  return (
    <div
      className="relative w-36 h-60 m-0 rounded-lg overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-in-out bg-white flex flex-col justify-end
                 hover:scale-105 hover:shadow-2xl"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick && onClick();
      }}
    >
      {/* Fondo con inicial */}
      <div className="absolute inset-0 w-full h-full bg-indigo-600 flex items-center justify-center z-10">
        <span className="text-6xl text-white font-bold">{nombre[0]}</span>
      </div>

      {/* Overlay de info */}
      <div className="relative z-20 bg-black bg-opacity-60 text-white p-3 text-center rounded-b-lg">
        <h3 className="m-0 text-lg font-bold drop-shadow-md truncate">{nombre}</h3>
        {descripcion && (
          <p
            className="m-0 text-xs font-medium text-gray-300 drop-shadow-sm line-clamp-2"
            title={descripcion}
          >
            {descripcion}
          </p>
        )}
      </div>
    </div>
  );
}
