import React, { useState } from 'react';
import EditarJugador from './EditarJugador';
import useUserRole from '../../../hooks/useUserRole';
import CloseButton from '../../common/FormComponents/CloseButton';

export default function ModalJugador({ jugador, onClose, onJugadorActualizado }) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const { uid } = useUserRole();


  const calcularEdad = fechaNacimiento => {
    if (!fechaNacimiento) return jugador.edad || 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleGuardar = actualizado => {
    setModoEdicion(false);
    onJugadorActualizado(actualizado);
  };

  const handleCerrarSubmodal = () => {
    setModoEdicion(false);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} />

        <div style={styles.contenido}>
          <div style={styles.header}>
            <img 
              src={jugador.foto || '/default-player.png'} 
              alt={`Foto de ${jugador.nombre}`} 
              style={styles.foto} 
            />
            <div style={styles.infoBasica}>
              <h2 style={styles.data}>{jugador.nombre}</h2>
              <p style={styles.data}><strong>Equipo actual:</strong> {jugador.equipoId?.nombre || jugador.equipo || 'Sin equipo'}</p>
              <p style={styles.data}><strong>Posición:</strong> {jugador.posicion || 'N/A'}</p>
              <p style={styles.data}><strong>Fecha nacimiento:</strong> {jugador.fechaNacimiento || 'N/A'}</p>
              <p style={styles.data}><strong>Edad:</strong> {calcularEdad(jugador.fechaNacimiento)}</p>
            </div>
          </div>

          <section style={styles.seccion}>
            <h3>Estadísticas individuales</h3>
            {jugador.estadisticas ? (
              <ul>
                {Object.entries(jugador.estadisticas).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay estadísticas disponibles.</p>
            )}
          </section>

          {jugador.creadoPor === uid && (
          <button
            onClick={() => setModoEdicion(true)}
            style={styles.botonEditar}
            disabled={modoEdicion}
          >
            ✎ Editar
          </button>
          )}
        </div>

        {modoEdicion && (
          <div onClick={handleCerrarSubmodal}>
            <div style={styles.submodal} onClick={e => e.stopPropagation()}>
              <EditarJugador
                jugador={jugador}
                onGuardar={handleGuardar}
                onCancelar={handleCerrarSubmodal}
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
    padding: '30px 20px',
    borderRadius: '16px',
    maxWidth: '700px',
    width: 'auto',
    maxHeight: '80dvh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  cerrar: {
    position: 'absolute', top: 10, right: 10,
    background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
  },
  contenido: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  foto: {
    width: '200px',
    height: '360px',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  infoBasica: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  seccion: {
    backgroundColor: 'var(--color-secundario)',
    borderRadius: '12px',
    padding: '15px',
  },
  botonEditar: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  data: {
    marginTop: 0,
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
