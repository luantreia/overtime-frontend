// src/compoents/modals/ModalEquipo.js

import React, { useState, useEffect } from 'react';
import EditarEquipo from './EditarEquipo';
import EncabezadoEquipo from './EncabezadoEquipo';
import SeccionResultados from './SeccionResultados';
import SeccionEstadisticas from './SeccionEstadisticas';
import SeccionJugadores from './SeccionJugadores';
import ModalJugador from '../ModalJugador/ModalJugador';
import CloseButton from '../../common/FormComponents/CloseButton';

function ModalEquipo({ equipo: equipoProp, onClose }) {
  const [equipo, setEquipo] = useState(equipoProp);
  const [jugadoresDelEquipo, setJugadoresDelEquipo] = useState([]);
  const [loadingJugadores, setLoadingJugadores] = useState(true);
  const [modalJugador, setModalJugador] = useState(null);
  const [modalEditarEquipo, setModalEditarEquipo] = useState(false); // NUEVO

  useEffect(() => {
    setEquipo(equipoProp);
  }, [equipoProp]);

  useEffect(() => {
    if (!equipo || !equipo._id) return;

    const controller = new AbortController();
    setLoadingJugadores(true);

    fetch(`https://overtime-ddyl.onrender.com/api/jugadores?equipoId=${equipo._id}`, {
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar jugadores');
        return res.json();
      })
      .then(data => {
        setJugadoresDelEquipo(data);
        setLoadingJugadores(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        console.error(err);
        setJugadoresDelEquipo([]);
        setLoadingJugadores(false);
      });

    return () => controller.abort();
  }, [equipo?._id]);

  const handleGuardar = (equipoActualizado) => {
    setEquipo(equipoActualizado);
    setModalEditarEquipo(false); // Cierra el modal
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
          <SeccionJugadores
            loading={loadingJugadores}
            jugadores={jugadoresDelEquipo}
            setModalJugador={setModalJugador}
          />
        </div>

        {modalJugador && (
          <ModalJugador
            jugador={modalJugador}
            onClose={() => setModalJugador(null)}
            onJugadorActualizado={actualizado => {
              if (actualizado) {
                setJugadoresDelEquipo(js =>
                  js.map(j => j._id === actualizado._id ? actualizado : j)
                );
              }
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
