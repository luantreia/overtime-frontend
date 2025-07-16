import React, { useState } from 'react';
import ModalBase from '../../ModalBase';
import SeccionDatosPartido from './SeccionDatosDatosPartido';
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
      {/* button */}
    </ModalBase>
  );
}
