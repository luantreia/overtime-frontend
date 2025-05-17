// ListaJugadores.js
import React from 'react';
import { useState, useEffect } from 'react';
import TarjetaJugador from '../components/models/tarjetajugador'; // o './Jugador' si se llama así tu archivo




function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [jugadorActivo, setJugadorActivo] = useState(null);

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const res = await fetch('https://overtime-ddyl.onrender.com/api/jugadores');
        const data = await res.json();
        setJugadores(data);
      } catch (err) {
        console.error('Error al cargar jugadores:', err);
      }
    };

    fetchJugadores();
  }, []);

  const handleExpand = (nombre) => {
    setJugadorActivo(jugadorActivo === nombre ? null : nombre);
  };

  return (
    <div style={styles.lista}>
      {jugadores.map((jugador, index) => (
        <TarjetaJugador
          key={index}
          nombre={jugador.nombre}
          equipo={jugador.equipoId?.nombre || 'Sin equipo'}
          posicion={Array.isArray(jugador.posicion) ? jugador.posicion.join(', ') : jugador.posicion}
          foto={jugador.foto}
          edad={jugador.edad}
          expandido={jugadorActivo === jugador.nombre}
          onExpand={() => handleExpand(jugador.nombre)}
        />
      ))}
    </div>
  );
}

const styles = {
  lista: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    padding: '10px',
  }
};

export default Jugadores;
