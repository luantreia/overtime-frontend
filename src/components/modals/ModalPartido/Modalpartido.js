import React, { useState, useEffect } from 'react';
import ModalEstadisticasCaptura from '../ModalEstadisticas/ModalEstadisticas';
import PartidoDatosGenerales from './PartidoDatosGenerales';
import PartidoSetsResumen from './PartidoSetsResumen';
import Button from '../../common/FormComponents/Button';
import useJugadores from '../../../hooks/useJugadores';
import CloseButton from '../../common/FormComponents/CloseButton';

export default function ModalPartido({ partido, onClose, token, refrescarPartidoSeleccionado, cargarPartidoPorId, agregarSetAPartido, actualizarSetDePartido }) {
  const [modalEstadisticasAbierto, setModalEstadisticasAbierto] = useState(false);
  const [setsLocales, setSetsLocales] = useState(partido.sets || []);
  const { jugadores } = useJugadores(token);
  
  useEffect(() => {
    setSetsLocales(partido.sets || []);
  }, [partido]);

  if (!partido) return null;

  const eliminarSetLocal = (numeroSet) => {
    setSetsLocales(prevSets => prevSets.filter(s => s.numeroSet !== numeroSet));
  };


  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <CloseButton onClick={onClose} />

        <h2>Partido</h2>

        <PartidoDatosGenerales partido={partido} />
        <PartidoSetsResumen sets={setsLocales} jugadores={jugadores} />


        <Button onClick={() => setModalEstadisticasAbierto(true)} variant="primary">
          Cargar estadísticas
        </Button>

        {modalEstadisticasAbierto && (
          <ModalEstadisticasCaptura
            partido={partido}
            partidoId={partido._id}
            token={token}
            onClose={() => setModalEstadisticasAbierto(false)}
            agregarSetAPartido={agregarSetAPartido}
            eliminarSetLocal={eliminarSetLocal}
            cargarPartidoPorId={cargarPartidoPorId}
            actualizarSetsLocales={setSetsLocales}
            actualizarSetDePartido={actualizarSetDePartido}
            refrescarPartidoSeleccionado={refrescarPartidoSeleccionado}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top:0, left:0, right:0, bottom:0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
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
  boton: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  }
};
