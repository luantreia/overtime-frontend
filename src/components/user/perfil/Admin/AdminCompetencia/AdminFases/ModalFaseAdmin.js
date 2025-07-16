import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../../ModalBase';
import SeccionDatosFase from './SeccionDatosFase';
import SeccionEquiposFase from './SeccionEquiposFase';
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
      
      {/* Navegación de secciones */}
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
          <SeccionEquiposFase
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
    </ModalBase>
  );
}
