import React, { useState } from 'react';
import ModalBase from '../../ModalBase';
import SeccionFasesTemporada from './SeccionFasesTemporada';
import SeccionParticipacionTemporada from './SeccionParticipacionTemporada';

const SECCIONES = [
  { key: 'fases', label: 'Fases' },
  { key: 'equipos', label: 'Equipos' },
  // puedes agregar más secciones aquí si quieres
];

export default function ModalTemporadaAdmin({ competenciaId, temporada, onClose, token }) {
  const [seccionActiva, setSeccionActiva] = useState('fases');

  if (!temporada) return null;

  return (
    <ModalBase open={!!temporada} onClose={onClose} title={`Temporada: ${temporada?.nombre}`}>
      {/* Navegación */}
      <div className="flex gap-2 mb-4 border-b pb-2">
        {SECCIONES.map(({ key, label }) => (
          <button
            key={key}
            className={`px-3 py-1 rounded font-semibold ${
              seccionActiva === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setSeccionActiva(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido por sección */}
      <div className="space-y-6">
        {seccionActiva === 'fases' && (
          <SeccionFasesTemporada temporada={temporada} temporadaId={temporada._id} token={token} />
        )}

        {seccionActiva === 'equipos' && (
          <SeccionParticipacionTemporada temporadaId={temporada._id} token={token} />
        )}
      </div>
    </ModalBase>
  );
}
