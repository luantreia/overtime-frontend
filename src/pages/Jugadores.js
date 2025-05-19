// src/pages/Jugadores.js
import React, { useState, useEffect } from 'react';
import TarjetaJugador from '../components/common/tarjetajugador';
import ModalJugador from '../components/modals/ModalJugador/ModalJugador';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [jugadorActivo, setJugadorActivo] = useState(null);
  const [modalJugador, setModalJugador] = useState(null);

  useEffect(() => {
    fetch('https://overtime-ddyl.onrender.com/api/jugadores')
      .then(res => res.json())
      .then(setJugadores)
      .catch(console.error);
  }, []);

  const handleJugadorActualizado = actualizado => {
    if (actualizado) {
      // Si llegó un jugador, lo actualizamos o agregamos
      setJugadores(js =>
        js.map(j => (j._id === actualizado._id ? actualizado : j))
      );
      setModalJugador(actualizado);
    } else {
      // Si actualizado es null, significa que se eliminó: filtramos
      setJugadores(js => js.filter(j => j._id !== modalJugador._id));
      setModalJugador(null);
    }
  };

  return (
    <div>
      <div style={styles.lista}>
        {jugadores.map(j => (
          <TarjetaJugador
            key={j._id}
            id={j._id}
            nombre={j.nombre}
            equipo={j.equipoId?.nombre || 'Sin equipo'}
            posicion={Array.isArray(j.posicion) ? j.posicion.join(', ') : j.posicion}
            edad={j.edad}
            foto={j.foto}
            expandido={jugadorActivo === j._id}
            onExpand={() => setJugadorActivo(jugadorActivo === j._id ? null : j._id)}
            onEditar={() => setModalJugador(j)}
          />
        ))}
      </div>

      {modalJugador && (
        <ModalJugador
          jugador={modalJugador}
          onClose={() => setModalJugador(null)}
          onJugadorActualizado={handleJugadorActualizado}
        />
      )}
    </div>
  );
}

const styles = {
  lista: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
};
