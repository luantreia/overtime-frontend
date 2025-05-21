// src/pages/Jugadores.js
import React, { useState, useEffect } from 'react';
import TarjetaJugador from '../components/common/tarjetajugador';
import ModalJugador from '../components/modals/ModalJugador/ModalJugador';
import PhysicsBall from '../components/common/PhysicsBall';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [jugadorActivo, setJugadorActivo] = useState(null);
  const [modalJugador, setModalJugador] = useState(null);
  const [orden, setOrden] = useState('aleatorio');

  const [cargando, setCargando] = useState(true);
  const [showPhysicsBall, setShowPhysicsBall] = useState(false);

  useEffect(() => {
    fetch('https://overtime-ddyl.onrender.com/api/jugadore')
      .then(res => res.json())
      .then(data => {
        setJugadores(ordenarJugadores(data, orden));
        setCargando(false);
      })
      .catch(console.error);
  }, [orden]);

  // Controla el timer para mostrar PhysicsBall solo si tarda > 3 segundos en cargar
  useEffect(() => {
    let timer;
    if (cargando) {
      timer = setTimeout(() => {
        setShowPhysicsBall(true);
      }, 3000);
    } else {
      setShowPhysicsBall(false);
    }
    return () => clearTimeout(timer);
  }, [cargando]);

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
      default:
        return copia;
    }
  };

  const handleOrdenChange = e => {
    const nuevoOrden = e.target.value;
    setOrden(nuevoOrden);
    // Ordenamos después de setOrden para reflejar el cambio de orden
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

  // Renderizado condicional
  if (cargando) {
    // Si está cargando y pasaron menos de 3s, mostramos solo mensaje
    if (!showPhysicsBall) {
      return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p>Cargando datos, por favor espera...</p>
        </div>
      );
    }
    // Si está cargando y pasaron 3s, mostramos PhysicsBall
    return <PhysicsBall />;
  }

  // Si no está cargando, renderizamos todo normalmente
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
            onClick={() => setModalJugador(j)}
            onJugadorClick={j => setModalJugador(j)}
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
