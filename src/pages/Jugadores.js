// src/pages/Jugadores.js
import React, { useState, useEffect } from 'react';
import TarjetaJugador from '../components/common/tarjetajugador';
import ModalJugador from '../components/modals/ModalJugador/ModalJugador';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [jugadorActivo, setJugadorActivo] = useState(null);
  const [modalJugador, setModalJugador] = useState(null);
  const [orden, setOrden] = useState('aleatorio');

  useEffect(() => {
    fetch('https://overtime-ddyl.onrender.com/api/jugadores')
      .then(res => res.json())
      .then(data => setJugadores(ordenarJugadores(data, orden)))
      .catch(console.error);
  }, []);

  const ordenarJugadores = (jugadores, criterio) => {
    const copia = [...jugadores];

    switch (criterio) {
      case 'nombre_asc':
        return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre_desc':
        return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'edad_asc':
        return copia.sort((a, b) => a.edad - b.edad);
      case 'edad_desc':
        return copia.sort((a, b) => b.edad - a.edad);
      case 'equipo':
        return copia.sort((a, b) =>
          (a.equipoId?.nombre || '').localeCompare(b.equipoId?.nombre || '')
        );
      case 'aleatorio':
        return copia.sort(() => Math.random() - 0.5);
    }
  };

  const handleOrdenChange = e => {
    const nuevoOrden = e.target.value;
    setOrden(nuevoOrden);
    setJugadores(js => ordenarJugadores(js, nuevoOrden));
  };

  const handleJugadorActualizado = actualizado => {
    if (actualizado) {
      setJugadores(js =>
        ordenarJugadores(
          js.map(j => (j._id === actualizado._id ? actualizado : j)),
          orden
        )
      );
      setModalJugador(actualizado);
    } else {
      setJugadores(js =>
        ordenarJugadores(
          js.filter(j => j._id !== modalJugador._id),
          orden
        )
      );
      setModalJugador(null);
    }
  };

  return (
    <div>
      <div style={styles.selector}>
        <label htmlFor="orden">Ordenar por: </label>
        <select id="orden" value={orden} onChange={handleOrdenChange}>
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="nombre_desc">Nombre (Z-A)</option>
          <option value="edad_asc">Edad (menor a mayor)</option>
          <option value="edad_desc">Edad (mayor a menor)</option>
          <option value="equipo">Equipo</option>
          <option value="aleatorio">Orden aleatorio</option>
        </select>
      </div>

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
  selector: {
    textAlign: 'center',
    margin: '1rem 0',
  },
  lista: {
    justifyContent: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
  },
};
