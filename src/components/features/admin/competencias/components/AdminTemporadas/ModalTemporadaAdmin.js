import React, { useState } from 'react';
import ModalBase from '../../../shared/ModalBase';
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
      <div className="space-y-6">
        {/* Navegación por secciones */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {SECCIONES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSeccionActiva(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  seccionActiva === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
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
      </div>
    </ModalBase>
  );
}
