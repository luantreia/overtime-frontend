import React from 'react';

function SeccionResumen({ competencia }) {
  const {
    nombre,
    descripcion,
    organizacion,
    modalidad,
    categoria,
    temporada,
    tipo,
    reglas,
    fechaInicio,
    fechaFin,
    estado
  } = competencia;

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-2">{nombre}</h2>
      {descripcion && <p className="mb-4 text-gray-700">{descripcion}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
        <div><strong>Organización:</strong> {organizacion?.nombre || 'N/A'}</div>
        <div><strong>Modalidad:</strong> {modalidad}</div>
        <div><strong>Categoría:</strong> {categoria}</div>
        <div><strong>Temporada:</strong> {temporada}</div>
        <div><strong>Tipo:</strong> {tipo}</div>
        <div><strong>Estado:</strong> {estado}</div>
        <div><strong>Fecha de inicio:</strong> {new Date(fechaInicio).toLocaleDateString()}</div>
        {fechaFin && <div><strong>Fecha de fin:</strong> {new Date(fechaFin).toLocaleDateString()}</div>}
        {reglas && (
          <div className="col-span-full">
            <strong>Reglas:</strong>
            <p className="mt-1 whitespace-pre-line">{reglas}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeccionResumen;
