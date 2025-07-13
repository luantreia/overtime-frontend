import React, { useState, useEffect } from 'react';
import EncabezadoEquipo from './EncabezadoEquipo';
import SeccionResultados from './SeccionResultados';
import SeccionEstadisticas from './SeccionEstadisticas';
import SeccionJugadores from './SeccionJugadores';
import CloseButton from '../../common/FormComponents/CloseButton';
import AsignarJugadoresEquipo from './AsignarJugadoresEquipo';
import { usePartidosDeEquipo } from '../../../hooks/usePartidosDeEquipo';
import { useAuth } from '../../../context/AuthContext';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';
import ModalJugadorEquipo from '../ModalJugador/ModalJugadorEquipo';

function ModalEquipo({ equipo: equipoProp, onClose }) {
  const [equipo, setEquipo] = useState(equipoProp);
  const [modalJugador, setModalJugador] = useState(null);
  const [modalAsignarJugadores, setModalAsignarJugadores] = useState(false);
  const [jugadoresVersion, setJugadoresVersion] = useState(0);
  const { token } = useAuth();

  const colorPrimario = equipo?.colores?.[0] || '#1e3a8a';
  const colorSecundario = equipo?.colores?.[1] || '#ffffff';

  const {
    relaciones,
    loading: loadingRelaciones,
    actualizarRelacion,
  } = useJugadorEquipo({ equipoId: equipo?._id, token });

  const { partidos: partidosDelEquipo } = usePartidosDeEquipo(equipo?._id);

  useEffect(() => {
    setEquipo(equipoProp);
  }, [equipoProp]);

  if (!equipoProp || !equipoProp._id) return null;

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
          <EncabezadoEquipo equipo={equipo} />

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
            onJugadorActualizado={() => {
              setModalJugador(null);
              setJugadoresVersion((v) => v + 1);
            }}
            actualizarRelacion={actualizarRelacion}
          />
        )}
      </div>
    </div>
  );
}

export default ModalEquipo;
