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


function ModalEquipo({ equipo: equipoProp, onClose }) {
  const [equipo, setEquipo] = useState(equipoProp);
  const [modalJugador, setModalJugador] = useState(null);
  const [modalEditarEquipo, setModalEditarEquipo] = useState(false);
  const [modalAsignarJugadores, setModalAsignarJugadores] = useState(false);
  const [jugadoresVersion, setJugadoresVersion] = useState(0);

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
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} />

        <EncabezadoEquipo equipo={equipo} onEditar={() => setModalEditarEquipo(true)} />
        <img src={equipo.foto} alt={equipo.nombre} style={styles.banner} />

        <div style={styles.secciones}>
          <SeccionResultados resultados={equipo.resultados} />
          <SeccionEstadisticas
            copas={equipo.copas}
            puntos={equipo.puntos}
            racha={equipo.racha}
          />
          <button onClick={() => setModalAsignarJugadores(true)}>Asignar jugadores</button>

          <SeccionJugadores
            equipoId={equipo._id}
            setModalJugador={setModalJugador}
          />
        </div>

        {modalAsignarJugadores && (
          <div onClick={() => setModalAsignarJugadores(false)} style={styles.submodal}>
            <div onClick={e => e.stopPropagation()} style={styles.submodalContent}>
              <AsignarJugadoresEquipo
                equipoId={equipo._id}
                onAsignar={() => {
                  setModalAsignarJugadores(false);
                  // Aquí podrías forzar recargar jugadores si fuera necesario
                  setJugadoresVersion(v => v + 1); // Por ejemplo: recargar con alguna función o actualización de estado
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
              // Opcional: aquí podrías hacer algo si querés actualizar la lista de jugadores
              setModalJugador(null);
            }}
          />
        )}

        {modalEditarEquipo && (
          <div onClick={handleCerrarSubmodal}>
            <div style={styles.submodal} onClick={e => e.stopPropagation()}>
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

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    height: '100dvh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '10px',
    boxSizing: 'border-box',
    overflowY: 'auto',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: 'var(--color-fondo)',
    padding: '40px 10px',
    borderRadius: '16px',
    maxWidth: '800px',
    width: 'auto',
    maxHeight: '80dvh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  banner: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  secciones: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'space-between',
  },
  submodal: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
  },
};

export default ModalEquipo;
