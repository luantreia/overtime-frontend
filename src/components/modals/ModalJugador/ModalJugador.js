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
          <div>
            <h2>{jugador.nombre}</h2>
            <p>
              <strong>Equipo:</strong>{' '}
              {jugador.equipoId?.nombre || jugador.equipo || 'Sin equipo'}
            </p>
            <p><strong>Posición:</strong> {jugador.posicion}</p>
            <p><strong>Edad:</strong> {jugador.edad}</p>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    padding: 20,
    borderRadius: 10,
    maxWidth: 400,
    width: '90%',
    position: 'relative',
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
};
