import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../../../shared/ModalBase';
import SeccionDatosFase from './SeccionDatosFase';
import SeccionParticipacionFase from './SeccionParticipacionFase';
import SeccionPartidosFase from './SeccionPartidosFase';  // Importa estos componentes
import SeccionTablaFase from './SeccionTablaFase';

const SECCIONES = [
  { key: 'datos', label: 'Datos' },
  { key: 'equipos', label: 'Equipos' },
  { key: 'partidos', label: 'Partidos' },   // Nueva sección
  { key: 'tabla', label: 'Tabla' },         // Nueva sección
];

export default function ModalFaseAdmin({ fase: faseProp, temporadaId, token, onClose }) {
  const [fase, setFase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('datos');

  const cargarDatos = useCallback(() => {
    if (!faseProp) {
      setLoading(false);
      return;
    }
    setFase(faseProp);
    setLoading(false);
  }, [faseProp]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  if (loading) return <ModalBase title="Cargando..." onClose={onClose}><p>Cargando fase...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;

  return (
    <ModalBase open={true} onClose={onClose} title={fase ? `Fase: ${fase.nombre}` : 'Nueva Fase'}>
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

        {/* Contenido según sección */}
        <div className="space-y-4">
          {seccionActiva === 'datos' && (
            <SeccionDatosFase
              fase={fase}
              setFase={setFase}
              temporadaId={temporadaId}
              token={token}
              onClose={onClose}
            />
          )}
          {seccionActiva === 'equipos' && fase?._id && (
            <SeccionParticipacionFase
              faseId={fase._id}
              temporadaId={temporadaId}
              token={token}
            />
          )}
          {seccionActiva === 'partidos' && fase?._id && (
            <SeccionPartidosFase
              faseId={fase._id}
              token={token}
            />
          )}
          {seccionActiva === 'tabla' && fase?._id && (
            <SeccionTablaFase
              fase={fase}
              faseId={fase._id}
              token={token}
            />
          )}
        </div>
      </div>
    </ModalBase>
  );
}
