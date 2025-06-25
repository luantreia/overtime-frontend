// src/components/modals/ModalPartido/PartidoDatosGenerales.js
import React from 'react';

export default function PartidoDatosGenerales({ partido }) {
  const {
    equipoLocal,
    equipoVisitante,
    fecha,
    ubicacion,
    estado,
    marcadorLocal,
    marcadorVisitante,
  } = partido;

  // Format date to local string, ensuring a fallback for null/undefined date
  const fechaFormateada = fecha ? new Date(fecha).toLocaleString() : 'Fecha no disponible';

  return (
    <section className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"> {/* Added background, padding, border for a card-like section */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Datos Generales</h3> {/* Title styling with bottom border */}
      <div className="space-y-2 text-gray-700"> {/* Container for paragraphs with vertical spacing */}
        <p><strong className="font-medium text-gray-900">Fecha:</strong> {fechaFormateada}</p>
        <p><strong className="font-medium text-gray-900">Ubicación:</strong> {ubicacion || 'No especificada'}</p> {/* Fallback for ubicacion */}
        <p><strong className="font-medium text-gray-900">Estado:</strong> {estado || 'No definido'}</p> {/* Fallback for estado */}
        <p className="mt-4 pt-2 border-t border-gray-200"> {/* Separator for marcador */}
          <strong className="font-bold text-lg text-gray-900"></strong>{' '}
          <span className="text-lg font-bold">
            {equipoLocal?.nombre || 'Equipo Local'} <span className="text-blue-600">{marcadorLocal ?? '-'}</span> - <span className="text-blue-600">{marcadorVisitante ?? '-'}</span> {equipoVisitante?.nombre || 'Equipo Visitante'}
          </span>
        </p>
      </div>
    </section>
  );
}