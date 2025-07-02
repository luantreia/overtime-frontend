// src/components/modals/ModalEquipo.js

import React, { useState, useEffect } from 'react';
import EditarEquipo from './EditarEquipo';
import EncabezadoEquipo from './EncabezadoEquipo';
import SeccionResultados from './SeccionResultados';
import SeccionEstadisticas from './SeccionEstadisticas';
import SeccionJugadores from './SeccionJugadores';
import ModalJugador from '../ModalJugador/ModalJugador';
import CloseButton from '../../common/FormComponents/CloseButton';
import AsignarJugadoresEquipo from './AsignarJugadoresEquipo';
import { usePartidosDeEquipo } from '../../../hooks/usePartidosDeEquipo';
// No longer importing Button as per our previous discussion

function ModalEquipo({ equipo: equipoProp, onClose }) {
  const [equipo, setEquipo] = useState(equipoProp);
  const [modalJugador, setModalJugador] = useState(null);
  const [modalEditarEquipo, setModalEditarEquipo] = useState(false);
  const [modalAsignarJugadores, setModalAsignarJugadores] = useState(false);
  const [jugadoresVersion, setJugadoresVersion] = useState(0); // This state is for triggering updates
  const { partidos: partidosDelEquipo, loading: loadingPartidos } = usePartidosDeEquipo(equipo._id);

  useEffect(() => {
    setEquipo(equipoProp);
  }, [equipoProp]);

  const handleGuardar = (equipoActualizado) => {
    setEquipo(equipoActualizado);
    setModalEditarEquipo(false);
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
        className="bg-white p-5 md:p-10 rounded-2xl max-w-2xl lg:max-w-4xl w-auto max-h-[80vh] overflow-y-auto relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose} />

        <EncabezadoEquipo equipo={equipo} onEditar={() => setModalEditarEquipo(true)} />
        <img src={equipo.foto} alt={equipo.nombre} className="w-full max-h-[300px] object-cover rounded-lg mb-5" />

        <div className="flex flex-wrap gap-5">
          <SeccionResultados resultados={partidosDelEquipo}  />
          <SeccionEstadisticas equipoId={equipo._id} />
          <SeccionJugadores
            equipoId={equipo._id}
            setModalJugador={setModalJugador}
            abrirAsignarJugadores={() => setModalAsignarJugadores(true)}
            jugadoresVersion={jugadoresVersion} // Passing this to potentially trigger re-fetch in SeccionJugadores
          />
        </div>

        {modalAsignarJugadores && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[1100] flex justify-center items-center p-2.5"
            onClick={() => setModalAsignarJugadores(false)}
          >
            <div className="bg-white p-8 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
              <AsignarJugadoresEquipo
                equipoId={equipo._id}
                onAsignar={() => {
                  setModalAsignarJugadores(false);
                  setJugadoresVersion(v => v + 1); // Increment to force a re-render/re-fetch in SeccionJugadores
                }}
                onCancelar={() => setModalAsignarJugadores(false)}
              />
            </div>
          </div>
        )}

        {modalJugador && (
          <ModalJugador
            jugador={modalJugador}
            onClose={() => setModalJugador(null)}
            onJugadorActualizado={actualizado => {
              // Optional: You could update the player list here if needed
              setModalJugador(null);
            }}
          />
        )}

        {modalEditarEquipo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[1100] flex justify-center items-center p-2.5"
            onClick={handleCerrarSubmodal}
          >
            <div className="bg-white p-8 rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
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