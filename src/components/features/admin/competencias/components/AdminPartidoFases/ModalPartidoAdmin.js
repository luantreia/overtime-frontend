import React, { useState } from 'react';
import ModalBase from '../../../shared/ModalBase';
import SeccionDatosPartido from './SeccionDatosPartido';
import SeccionEquiposPartido from './SeccionEquiposPartido';

const SECCIONES = [
  { key: 'datos', label: 'Datos' },
  { key: 'equipos', label: 'Equipos' },
  // futuras: jugadores, sets, marcador, estadísticas...
];

export default function ModalPartidoAdmin({
  partido,
  faseId,
  token,
  participantes,
  onGuardar,
  onCerrar,
}) {
  const [seccionActiva, setSeccionActiva] = useState('datos');
  const [partidoLocal, setPartidoLocal] = useState(partido || null);

  const handleActualizarPartido = (actualizado) => {
    setPartidoLocal(actualizado);
    onGuardar?.(); // trigger externo
  };

  return (
    <ModalBase title={partidoLocal ? 'Editar Partido' : 'Nuevo Partido'} onClose={onCerrar}>
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

        {/* Contenido de sección */}
        {seccionActiva === 'datos' && (
          <SeccionDatosPartido
            partido={partidoLocal}
            faseId={faseId}
            participantes={participantes}
            token={token}
            onGuardar={handleActualizarPartido}
          />
        )}
        {seccionActiva === 'equipos' && partidoLocal?._id && (
          <SeccionEquiposPartido
            partido={partidoLocal}
            token={token}
          />
        )}
      </div>
    </ModalBase>
  );
}
