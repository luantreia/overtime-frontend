import React, { useState, useEffect, useMemo } from 'react';
import CloseButton from '../../common/FormComponents/CloseButton';
import SeccionResumen from './Secciones/SeccionResumen';
import SeccionEquipos from './Secciones/SeccionEquipos';
import SeccionPartidos from './Secciones/SeccionPartidos';
import SeccionTablaLiga from './Secciones/SeccionTablaLiga';
import ModalEditorEquiposFase from './ModalEditorEquiposFase';
import { useCompetenciaPorId } from '../../../hooks/useCompetencias';
import { useFases } from '../../../hooks/useFases';
import ModalFaseFormulario from './ModalFaseFormulario';
import EditorEquipos from './EditorEquipos';
import { useAuth } from '../../../context/AuthContext';

function ModalCompetencia({ competenciaId, onClose }) {
  const { token, user } = useAuth();
  const { competencia, loading, error } = useCompetenciaPorId(competenciaId, token);
  const { fases, agregar, editar } = useFases(competencia?._id);

  // Estados locales
  const [faseSeleccionadaId, setFaseSeleccionadaId] = useState(null);
  const [mostrarModalFase, setMostrarModalFase] = useState(false);
  const [faseAEditar, setFaseAEditar] = useState(null);
  const [mostrarEditorEquipos, setMostrarEditorEquipos] = useState(false);
  const [mostrarModalEquiposFase, setMostrarModalEquiposFase] = useState(false);
  const [faseGuardada, setFaseGuardada] = useState(null);

  // Seleccionar primera fase disponible por defecto
  useEffect(() => {
    if (fases.length > 0 && !faseSeleccionadaId) {
      setFaseSeleccionadaId(fases[0]._id);
    }
  }, [fases, faseSeleccionadaId]);

  // Memo para controlar permisos
  const esAdminDeCompetencia = useMemo(() => {
    if (!user || !competencia) return false;
    const uid = user.uid;
    const admins = competencia.administradores || [];
    return user.rol === 'admin' || competencia.creadoPor === uid || admins.includes(uid);
  }, [user, competencia]);

  // Handler guardar fase
  const handleGuardarFase = async (fase) => {
    if (fase._id) {
      await editar(fase._id, fase);
    } else {
      await agregar({ ...fase, competencia: competencia._id });
    }

    setFaseGuardada(fase);
    setMostrarModalFase(false);

    if (['liga', 'grupo'].includes(fase.tipo)) {
      setMostrarModalEquiposFase(true);
    }
  };

  // Render botones edición equipos
  const renderBotonEditarEquipos = () => {
    if (!esAdminDeCompetencia) return null;
    if (!mostrarEditorEquipos) {
      return (
        <div className="text-right">
          <button
            className="bg-green-600 text-white rounded px-4 py-1 text-sm"
            onClick={() => setMostrarEditorEquipos(true)}
          >
            Editar equipos
          </button>
        </div>
      );
    }
    return (
      <div className="mb-4">
        <EditorEquipos competenciaId={competencia._id} onCerrar={() => setMostrarEditorEquipos(false)} />
        <div className="text-right mt-2">
          <button
            className="bg-red-600 text-white rounded px-4 py-1 text-sm"
            onClick={() => setMostrarEditorEquipos(false)}
          >
            Cerrar editor de equipos
          </button>
        </div>
      </div>
    );
  };

  // Render botón nueva fase
  const renderBotonNuevaFase = () => {
    if (!esAdminDeCompetencia) return null;
    return (
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
    );
  };

  // Render botón editar equipos fase
  const renderBotonEditarEquiposFase = () => {
    if (!esAdminDeCompetencia || !faseSeleccionadaId) return null;
    return (
      <div className="text-right mt-2">
        <button
          className="bg-purple-600 text-white rounded px-4 py-1 text-sm"
          onClick={() => {
            const fase = fases.find(f => f._id === faseSeleccionadaId);
            setFaseGuardada(fase);
            setMostrarModalEquiposFase(true);
          }}
        >
          Editar equipos de la fase
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full text-center"
          onClick={e => e.stopPropagation()}
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
          onClick={e => e.stopPropagation()}
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
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose} />
        <SeccionResumen competencia={competencia} />

        <div className="space-y-6 mt-6">

          {renderBotonEditarEquipos()}

          {renderBotonNuevaFase()}

          {/* Selector de fase */}
          {fases.length > 0 && (
            <div className="mt-4">
              <label htmlFor="select-fase" className="block mb-1 font-semibold">
                Seleccionar fase:
              </label>
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

          {renderBotonEditarEquiposFase()}

          {/* Modales */}
          {mostrarModalFase && (
            <ModalFaseFormulario
              fases={fases}
              onGuardar={handleGuardarFase}
              onClose={() => setMostrarModalFase(false)}
            />
          )}

          {mostrarModalEquiposFase && faseGuardada && (
            <ModalEditorEquiposFase
              competenciaId={competencia._id}
              tipoFase={faseGuardada.tipo}
              faseId={faseGuardada._id}
              fases={fases}
              onClose={() => setMostrarModalEquiposFase(false)}
            />
          )}

          {/* Tabla de posiciones */}
          {faseSeleccionadaId && (
            <SeccionTablaLiga competenciaId={competencia._id} faseId={faseSeleccionadaId} />
          )}

          {/* Partidos */}
          <SeccionPartidos competenciaId={competencia._id} />

          {/* Estadísticas (futuro) */}
          {/* <SeccionEstadisticas competenciaId={competencia._id} /> */}
        </div>
      </div>
    </div>
  );
}

export default ModalCompetencia;
