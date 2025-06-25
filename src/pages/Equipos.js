import React, { useState, useEffect } from 'react';
import TarjetaEquipo from '../components/modals/ModalEquipo/tarjetaequipo.js';
import ModalEquipo from '../components/modals/ModalEquipo/ModalEquipo.js';

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [equiposOrdenados, setEquiposOrdenados] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [orden, setOrden] = useState('aleatorio');

  
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await fetch('https://overtime-ddyl.onrender.com/api/equipos');
        const data = await response.json();
        setEquipos(data);
      } catch (error) {
        console.error('Error al obtener equipos:', error);
      }
    };

    fetchEquipos();
  }, []);

  useEffect(() => {
    if (equipos.length > 0) {
      const ordenados = ordenarEquipos([...equipos], orden);
      setEquiposOrdenados(ordenados);
      setPaginaActual(1); // reinicia a la primera página si cambia el orden
    }
  }, [equipos, orden]);

  const ordenarEquipos = (lista, criterio) => {
    switch (criterio) {
      case 'nombre_asc':
        return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre_desc':
        return lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  };

  const handleOrdenChange = (e) => {
    setOrden(e.target.value);
  };

  const indiceUltimo = paginaActual * itemsPorPagina;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const equiposPagina = equiposOrdenados.slice(indiceInicio, indiceInicio + itemsPorPagina);
  
  const totalPaginas = Math.ceil(equiposOrdenados.length / itemsPorPagina);
  

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
          <option value="aleatorio">Orden aleatorio</option>
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="nombre_desc">Nombre (Z-A)</option>
        </select>
      </div>

      <div className="lista px-0" aria-live="polite">        
        {equiposPagina.map((equipo, index) => (
          <TarjetaEquipo
            key={equipo._id || index}
            nombre={equipo.nombre}
            escudo={equipo.escudo}
            onClick={() => setEquipoSeleccionado(equipo)}
          />
        ))}
      </div>

      <nav
        aria-label="Paginación de jugadores"
        style={{ textAlign: 'center', marginTop: 20, marginBottom: 40 }}
      >
        {renderPaginacion()}
      </nav>  
      {equipoSeleccionado && (
        <ModalEquipo
          equipo={equipoSeleccionado}
          onClose={() => setEquipoSeleccionado(null)}
        />
      )}
    </div>
  );
}
