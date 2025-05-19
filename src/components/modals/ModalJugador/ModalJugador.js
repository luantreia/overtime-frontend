// src/components/modals/ModalJugador/ModalJugador.js
import React, { useState } from 'react';
import EditarJugador from './EditarJugador';

export default function ModalJugador({ jugador, onClose, onJugadorActualizado }) {
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleGuardar = actualizado => {
    setModoEdicion(false);
    onJugadorActualizado(actualizado);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={styles.cerrar}>✖</button>

        {modoEdicion ? (
          <EditarJugador
            jugador={jugador}
            onGuardar={handleGuardar}
            onCancelar={() => setModoEdicion(false)}
          />
        ) : (
            <div style={styles.secciones}>
            <div style={styles.encabezado}>
                <h2>{jugador.nombre}</h2>
                <p>
                <strong>Equipo:</strong>{' '}
                {jugador.equipoId?.nombre || jugador.equipo || 'Sin equipo'}
                </p>
                <p><strong>Posición:</strong> {jugador.posicion}</p>
                <p><strong>Edad:</strong> {jugador.edad}</p>
                </div>
                <button
                onClick={() => setModoEdicion(true)}
                style={styles.botonEditar}
                >
                ✎ Editar
                </button>
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
  },
  modal: {
    backgroundColor: 'var(--color-fondo)',
    padding: '40px 10px',
    borderRadius: '16px',
    maxWidth: '800px',
    minWidth: "300px",
    width: 'auto',  
    maxHeight: '80dvh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  cerrar: {
    position: 'absolute', top: 10, right: 10,
    background: 'none', border: 'none', fontSize: 18, cursor: 'pointer',
  },
  botonEditar: {
    marginTop: '12px',
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  encabezado: {
    justifyContent: 'space-between',
    gap: '15px',
    marginBottom: '15px',
  },
};
