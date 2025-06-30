import React, { useState, useEffect } from 'react';
import CloseButton from '../../common/FormComponents/CloseButton';
import SeccionResumen from './Secciones/SeccionResumen';
import SeccionEquipos from './Secciones/SeccionEquipos';
import SeccionPartidos from './Secciones/SeccionPartidos';
import SeccionTablaLiga from './Secciones/SeccionTablaLiga';
// import SeccionEstadisticas from './SeccionEstadisticas'; // futuro

import { useCompetenciaPorId } from '../../../hooks/useCompetencias';
import { useFases } from '../../../hooks/useFases';
import ModalFase from './ModalFase';
import EditorEquipos from './EditorEquipos';
import { useAuth } from '../../../context/AuthContext';

function ModalCompetencia({ competenciaId, onClose }) {
  const { token, user } = useAuth();
  const { competencia, loading, error } = useCompetenciaPorId(competenciaId, token);
  const [mostrarModalFase, setMostrarModalFase] = useState(false);
  const [faseAEditar, setFaseAEditar] = useState(null);
  const { fases, agregar, editar } = useFases(competencia?._id);
  const [mostrarEditorEquipos, setMostrarEditorEquipos] = useState(false);
  // Estado para la fase seleccionada en la tabla de posiciones
  const [faseSeleccionadaId, setFaseSeleccionadaId] = useState(null);

  useEffect(() => {
    // Si cambian las fases, seleccionamos la primera por defecto (si no hay fase seleccionada)
    if (fases.length > 0 && !faseSeleccionadaId) {
      setFaseSeleccionadaId(fases[0]._id);
    }
  }, [fases, faseSeleccionadaId]);

  const esAdminDeCompetencia = () => {
    if (!user || !competencia) return false;
    const uid = user.uid;
    const admins = competencia.administradores || [];
    return (
      user.rol === 'admin' ||
      competencia.creadoPor === uid ||
      admins.some(id => id === uid)
    );
  };
  const admin = esAdminDeCompetencia();

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-gray-700">Cargando competencia...</p>
        </div>
      </div>
    );
  }

  if (error || !competencia) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-red-600 font-semibold">Error al cargar competencia.</p>
        </div>
      </div>
    );
  }

 return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-2.5"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClick={onClose} />
        <SeccionResumen competencia={competencia} />

        <div className="space-y-6 mt-6">
          <SeccionEquipos competenciaId={competencia._id} />

          {admin && !mostrarEditorEquipos && (
            <div className="text-right">
              <button
                className="bg-green-600 text-white rounded px-4 py-1 text-sm"
                onClick={() => setMostrarEditorEquipos(true)}
              >
                Editar equipos
              </button>
            </div>
          )}

          {admin && mostrarEditorEquipos && (
            <div className="mb-4">
              <EditorEquipos 
                competenciaId={competencia._id} 
                onCerrar={() => setMostrarEditorEquipos(false)} 
              />
              <div className="text-right mt-2">
                <button
                  className="bg-red-600 text-white rounded px-4 py-1 text-sm"
                  onClick={() => setMostrarEditorEquipos(false)}
                >
                  Cerrar editor de equipos
                </button>
              </div>
            </div>
          )}

          {/* Botón para agregar nueva fase */}
          {admin && (
            <div className="text-right">
              <button
                className="bg-blue-600 text-white rounded px-4 py-1 text-sm"
                onClick={() => {
                  setFaseAEditar(null);
                  setMostrarModalFase(true);
                }}
              >
                + Nueva fase
              </button>
            </div>
          )}

          {/* Dropdown para seleccionar fase */}
          {fases.length > 0 && (
            <div className="mt-4">
              <label htmlFor="select-fase" className="block mb-1 font-semibold">Seleccionar fase:</label>
              <select
                id="select-fase"
                className="border rounded px-2 py-1 w-full max-w-xs"
                value={faseSeleccionadaId || ''}
                onChange={e => setFaseSeleccionadaId(e.target.value)}
              >
                {fases.map(fase => (
                  <option key={fase._id} value={fase._id}>
                    {fase.nombre} ({fase.tipo})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Modal para crear/editar fase */}
          {mostrarModalFase && (
            <ModalFase
              faseInicial={faseAEditar || { competencia: competencia._id }}
              fasesDisponibles={fases.filter(f => f._id !== (faseAEditar?._id || ''))}
              onGuardar={async (fase) => {
                if (fase._id) await editar(fase._id, fase);
                else await agregar({ ...fase, competencia: competencia._id });
                setMostrarModalFase(false);
              }}
              onClose={() => setMostrarModalFase(false)}
            />
          )}

          {/* Tabla de posiciones de la fase seleccionada */}
          {faseSeleccionadaId && (
            <SeccionTablaLiga competenciaId={competencia._id} faseId={faseSeleccionadaId} />
          )}

          {/* Listado de partidos de la competencia */}
          <SeccionPartidos competenciaId={competencia._id} />

          {/* <SeccionEstadisticas competenciaId={competencia._id} /> */}
        </div>
      </div>
    </div>
  );
}

export default ModalCompetencia;
