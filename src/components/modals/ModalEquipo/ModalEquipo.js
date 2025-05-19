import React, { useState, useEffect } from 'react';
import EditarEquipo from './EditarEquipo';
import EncabezadoEquipo from './EncabezadoEquipo';
import SeccionResultados from './SeccionResultados';
import SeccionEstadisticas from './SeccionEstadisticas';
import SeccionJugadores from './SeccionJugadores';
import BotonEditar from '../../common/BotonEditar';

function ModalEquipo({ equipo: equipoProp, onClose, isAdmin }) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [equipo, setEquipo] = useState(equipoProp);
  const [jugadoresDelEquipo, setJugadoresDelEquipo] = useState([]);
  const [loadingJugadores, setLoadingJugadores] = useState(true);

  useEffect(() => {
    if (!equipo._id) return;

    setLoadingJugadores(true);

    fetch(`https://overtime-ddyl.onrender.com/api/jugadores?equipoId=${equipo._id}`)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar jugadores');
        return res.json();
      })
      .then(data => {
        setJugadoresDelEquipo(data);
        setLoadingJugadores(false);
      })
      .catch(err => {
        console.error(err);
        setJugadoresDelEquipo([]);
        setLoadingJugadores(false);
      });
  }, [equipo._id]);

  const handleGuardar = (equipoActualizado) => {
    setEquipo(equipoActualizado);
    setModoEdicion(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={styles.cerrar}>✖</button>

        {modoEdicion ? (
          <EditarEquipo
            equipo={equipo}
            onGuardar={handleGuardar}
            onCancelar={() => setModoEdicion(false)}
          />
        ) : (
          <>
            <EncabezadoEquipo equipo={equipo} onEditar={() => setModoEdicion(true)} isAdmin={isAdmin} />
            <img src={equipo.foto} alt={equipo.nombre} style={styles.banner} />

            <div style={styles.secciones}>
              <SeccionResultados resultados={equipo.resultados} />
              <SeccionEstadisticas
                copas={equipo.copas}
                puntos={equipo.puntos}
                racha={equipo.racha}
              />
              <SeccionJugadores loading={loadingJugadores} jugadores={jugadoresDelEquipo} />
            </div>
          </>
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
  },
  modal: {
    backgroundColor: 'var(--color-fondo)',
    padding: '20px 10px',
    borderRadius: '16px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: 'calc(100dvh - 20px)',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  cerrar: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    fontSize: '22px',
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    transition: 'color 0.2s',
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
  }
};

export default ModalEquipo;
