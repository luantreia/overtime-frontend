// src/pages/Jugadores.js
import React, { useState, useEffect } from 'react';
import TarjetaJugador from '../components/modals/ModalJugador/tarjetajugador';
import ModalJugador from '../components/modals/ModalJugador/ModalJugador';
import PhysicsBall from '../components/common/LoadingGame/PhysicsBall';

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [modalJugador, setModalJugador] = useState(null);
  const [orden, setOrden] = useState('aleatorio');
  const [cargando, setCargando] = useState(true);
  const [showPhysicsBall, setShowPhysicsBall] = useState(false);

  // Paginación
  const itemsPorPagina = 20;
  const [paginaActual, setPaginaActual] = useState(1);

  const ordenarJugadores = (lista, criterio) => {
    const copia = [...lista];
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
      default:
        return copia.sort(() => Math.random() - 0.5);
    }
  };

  useEffect(() => {
    setCargando(true);
    fetch('https://overtime-ddyl.onrender.com/api/jugadores')
      .then(res => res.json())
      .then(data => {
        setJugadores(ordenarJugadores(data, orden));
        setCargando(false);
        setPaginaActual(1); // Reseteamos página al cambiar orden
      })
      .catch(error => {
        console.error('Error al cargar jugadores:', error);
        setCargando(false);
      });
  }, [orden]);

  useEffect(() => {
    let timer;
    if (cargando) {
      timer = setTimeout(() => setShowPhysicsBall(true), 3000);
    } else {
      setShowPhysicsBall(false);
    }
    return () => clearTimeout(timer);
  }, [cargando]);

  const handleOrdenChange = (e) => {
    setOrden(e.target.value);
  };

  const handleJugadorActualizado = (actualizado) => {
    if (actualizado) {
      setJugadores(jugadoresPrev =>
        ordenarJugadores(
          jugadoresPrev.map(j => (j._id === actualizado._id ? actualizado : j)),
          orden
        )
      );
      setModalJugador(actualizado);
    } else {
      setJugadores(jugadoresPrev =>
        ordenarJugadores(
          jugadoresPrev.filter(j => j._id !== modalJugador._id),
          orden
        )
      );
      setModalJugador(null);
    }
  };

  // Paginación: calcular jugadores visibles
  const indiceUltimo = paginaActual * itemsPorPagina;
  const indicePrimero = indiceUltimo - itemsPorPagina;
  const jugadoresPagina = jugadores.slice(indicePrimero, indiceUltimo);

  // Número total de páginas
  const totalPaginas = Math.ceil(jugadores.length / itemsPorPagina);

  // Render botones paginación
  const renderPaginacion = () => {
    const botones = [];
    for (let i = 1; i <= totalPaginas; i++) {
      botones.push(
        <button
          key={i}
          onClick={() => setPaginaActual(i)}
          disabled={i === paginaActual}
          style={{
            margin: '0 4px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: i === paginaActual ? '2px solid var(--color-secundario)' : '1px solid #ccc',
            backgroundColor: i === paginaActual ? 'var(--color-secundario)' : 'white',
            color: i === paginaActual ? 'white' : 'black',
            cursor: i === paginaActual ? 'default' : 'pointer',
          }}
          aria-current={i === paginaActual ? 'page' : undefined}
          aria-label={`Página ${i}`}
        >
          {i}
        </button>
      );
    }
    return botones;
  };

  if (cargando) {
    if (!showPhysicsBall) {
      return (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p>Cargando datos, por favor espera...</p>
        </div>
      );
    }
    return <PhysicsBall />;
  }

  return (
    <div className="p-2">
      <div className="selector" style={{ marginBottom: 16 }}>
        <label htmlFor="orden" className="block mb-2 font-semibold text-gray-700">
          Ordenar por:
        </label>
        <select
          id="orden"
          value={orden}
          onChange={handleOrdenChange}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="nombre_desc">Nombre (Z-A)</option>
          <option value="edad_asc">Edad (menor a mayor)</option>
          <option value="edad_desc">Edad (mayor a menor)</option>
          <option value="equipo">Equipo</option>
          <option value="aleatorio">Orden aleatorio</option>
        </select>
      </div>

      <div className="lista px-0" aria-live="polite">
        {jugadoresPagina.map(j => (
          <TarjetaJugador
            key={j._id}
            id={j._id}
            nombre={j.nombre}
            equipo={j.equipoId?.nombre || 'Sin equipo'}
            posicion={Array.isArray(j.posicion) ? j.posicion.join(', ') : j.posicion}
            edad={j.edad}
            foto={j.foto}
            onClick={() => setModalJugador(j)}
            onJugadorClick={() => setModalJugador(j)}
          />
        ))}
      </div>

      <nav
        aria-label="Paginación de jugadores"
        style={{ textAlign: 'center', marginTop: 20, marginBottom: 40 }}
      >
        {renderPaginacion()}
      </nav>

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
