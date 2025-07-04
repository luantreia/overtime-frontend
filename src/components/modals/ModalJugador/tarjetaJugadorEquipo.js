import React from 'react';

export default function TarjetaJugadorEquipo({ jugador, relacion, onClick }) {
  if (!jugador || !relacion) return null;

  const {
    nombre,
    edad,
    nacionalidad,
    foto: fotoJugador,
  } = jugador;

  const {
    foto: fotoRelacion,
    numero,
    rol,
    equipo,
  } = relacion;

  const imagen = fotoRelacion || fotoJugador;
  const tieneImagen = imagen && imagen.trim() !== '';
  const escudo = equipo?.escudo;
  const colorBorde = equipo?.colores?.primario || 'white';

  return (
    <div
      className="relative w-36 h-60 overflow-hidden shadow-xl border-4 hover:scale-105 transition cursor-pointer"
      onClick={onClick}
      style={{
        borderColor: colorBorde,
        borderRadius: 12,
        boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
      }}
    >
      {/* Imagen de fondo */}
      {tieneImagen && (
        <img
          src={imagen}
          alt={`Jugador ${nombre}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradiente oscuro para contraste */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

      {/* Escudo en la esquina superior */}
      {escudo && (
        <div className="absolute top-1 left-1 z-20 bg-white p-[2px] shadow-md border border-gray-200 rounded-sm">
          <img
            src={escudo}
            alt="Escudo del equipo"
            className="w-7 h-7 object-contain"
          />
        </div>
      )}

      {/* Contenido textual sobre la imagen */}
      <div className="relative z-20 h-full flex flex-col justify-end p-2 text-white text-center">
        <h3 className="text-md font-bold leading-tight">{nombre}</h3>
        {numero && (
          <p className="text-sm font-medium">#{numero}</p>
        )}
        {rol && (
          <p className="text-xs italic text-yellow-300">{rol}</p>
        )}
        {(edad || nacionalidad) && (
          <p className="text-xs text-gray-200">
            {edad ? `${edad} años` : ''}{edad && nacionalidad ? ' · ' : ''}{nacionalidad || ''}
          </p>
        )}
      </div>
    </div>
  );
}
