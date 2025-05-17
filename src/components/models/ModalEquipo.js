import React, { useState } from 'react';
import jugadores from '../../data/jugadores';
import TarjetaJugador from './tarjetajugador';
import EditarEquipo from './EditarEquipo';

function ModalEquipo({ equipo: equipoProp, onClose }) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [equipo, setEquipo] = useState(equipoProp);

  const jugadoresDelEquipo = jugadores.filter(j =>
    j.equipo?.trim().toLowerCase() === equipo.nombre?.trim().toLowerCase()
  );

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
            <div style={styles.encabezado}>
              <img src={equipo.escudo || equipo.foto} alt="Escudo" style={styles.escudo} />
              <h2>{equipo.nombre}</h2>
              <button onClick={() => setModoEdicion(true)} style={styles.botonEditar}>✎ Editar</button>
            </div>

            <img src={equipo.foto} alt={equipo.nombre} style={styles.banner} />

            <div style={styles.secciones}>
              <div style={styles.seccion}>
                <h3>Últimos Resultados</h3>
                <ul>
                  {equipo.resultados?.length > 0 ? (
                    equipo.resultados.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <li>Sin datos</li>
                  )}
                </ul>
              </div>

              <div style={styles.seccion}>
                <h3>Estadísticas</h3>
                <p><span role="img" aria-label="copas">🏆</span> Copas: {equipo.copas || 0}</p>
                <p><span role="img" aria-label="puntos">💥</span> Puntos: {equipo.puntos || 0}</p>
                <p><span role="img" aria-label="fuego">🔥</span> Racha: {equipo.racha || 'N/A'}</p>
              </div>

              <div style={styles.seccion}>
                <h3>Jugadores</h3>
                {jugadoresDelEquipo.length > 0 ? (
                  <div style={styles.jugadoresGrid}>
                    {jugadoresDelEquipo.map((jugador, i) => (
                      <TarjetaJugador
                        key={i}
                        jugador={jugador}
                        nombre={jugador.nombre}
                        equipo={jugador.equipo}
                        posicion={jugador.posicion}
                        foto={jugador.foto}
                      />
                    ))}
                  </div>
                ) : (
                  <p>Sin jugadores asignados</p>
                )}
              </div>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
    margin: '20px',
  },
  modal: {
    backgroundColor: 'var(--color-fondo)',
    padding: '20px 10px',
    borderRadius: '16px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
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
  encabezado: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px',
    marginBottom: '15px',
  },
  escudo: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
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
  seccion: {
    flex: '1 1 250px',
    backgroundColor: "var(--color-fondo-secundario)",
    padding: '10px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  jugadoresGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'center',
  },
  botonEditar: {
    padding: '6px 12px',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333'
  }
};

export default ModalEquipo;
