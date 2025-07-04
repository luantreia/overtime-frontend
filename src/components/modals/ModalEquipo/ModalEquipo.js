import React, { useState, useEffect } from 'react';
import EditarEquipo from './EditarEquipo';
import EncabezadoEquipo from './EncabezadoEquipo';
import SeccionResultados from './SeccionResultados';
import SeccionEstadisticas from './SeccionEstadisticas';
import SeccionJugadores from './SeccionJugadores';
import CloseButton from '../../common/FormComponents/CloseButton';
import AsignarJugadoresEquipo from './AsignarJugadoresEquipo';
import { usePartidosDeEquipo } from '../../../hooks/usePartidosDeEquipo';
import { useAuth } from '../../../context/AuthContext';

// Importamos el hook
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';

import ModalJugadorEquipo from '../ModalJugador/ModalJugadorEquipo';

function ModalEquipo({ equipo: equipoProp, onClose, onEditarEquipo }) {
  const [equipo, setEquipo] = useState(equipoProp);
  const [modalJugador, setModalJugador] = useState(null);
  const [modalEditarEquipo, setModalEditarEquipo] = useState(false);
  const [modalAsignarJugadores, setModalAsignarJugadores] = useState(false);
  const [jugadoresVersion, setJugadoresVersion] = useState(0);
  const { user, rol, token } = useAuth();

  const colorPrimario = equipo?.colores?.[0] || '#1e3a8a'; // azul por defecto
  const colorSecundario = equipo?.colores?.[1] || '#ffffff';

  const {
    relaciones,
    loading: loadingRelaciones,
    error: errorRelaciones,
    actualizarRelacion,
  } = useJugadorEquipo({ equipoId: equipo?._id, token });

  const { partidos: partidosDelEquipo } = usePartidosDeEquipo(equipo?._id);

  useEffect(() => {
    setEquipo(equipoProp);
  }, [equipoProp]);

  if (!equipoProp || !equipoProp._id) return null;

  const handleGuardar = async (datosActualizados) => {
    try {
      const actualizado = await onEditarEquipo(equipo?._id, datosActualizados);
      setEquipo(actualizado);
      setModalEditarEquipo(false);
    } catch (err) {
      console.error('Error al editar equipo:', err);
      alert('Error al guardar los cambios.');
    }
  };

  const handleCerrarSubmodal = () => {
    setModalEditarEquipo(false);
  };

  return (
    <div
      className="fixed inset-0 h-screen flex justify-center items-center z-50 p-2.5 box-border overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto relative shadow-2xl"
        style={{
          background: `linear-gradient(to bottom right, ${colorPrimario}, ${colorSecundario})`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          
          <CloseButton onClick={onClose} />
          
          <EncabezadoEquipo
            equipo={equipo}
            onEditar={() => setModalEditarEquipo(true)}
          />

          <div className="flex flex-wrap gap-5">
            <SeccionResultados resultados={partidosDelEquipo} />
            <SeccionEstadisticas equipoId={equipo._id} />
            <SeccionJugadores
              equipoId={equipo._id}
              setModalJugador={setModalJugador}
              abrirAsignarJugadores={() => setModalAsignarJugadores(true)}
              jugadoresVersion={jugadoresVersion}
              relaciones={relaciones}
              loading={loadingRelaciones}
            />
          </div>
        </div>

        {/* Submodales */}
        {modalAsignarJugadores && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[1100] flex justify-center items-center p-2.5"
            onClick={() => setModalAsignarJugadores(false)}
          >
            <div className="bg-white p-8 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <AsignarJugadoresEquipo
                equipoId={equipo._id}
                onAsignar={() => {
                  setModalAsignarJugadores(false);
                  setJugadoresVersion((v) => v + 1);
                }}
                onCancelar={() => setModalAsignarJugadores(false)}
              />
            </div>
          </div>
        )}

        {modalJugador && (
          <ModalJugadorEquipo
            relacion={modalJugador}
            onClose={() => setModalJugador(null)}
            onJugadorActualizado={(actualizada) => {
              setModalJugador(null);
              setJugadoresVersion((v) => v + 1);
            }}
            actualizarRelacion={actualizarRelacion}
          />
        )}

        {modalEditarEquipo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[1100] flex justify-center items-center p-2.5"
            onClick={handleCerrarSubmodal}
          >
            <div className="bg-white p-8 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <EditarEquipo
                equipo={equipo}
                onGuardar={handleGuardar}
                onCancelar={() => setModalEditarEquipo(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default ModalEquipo;
