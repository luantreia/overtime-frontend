import React, { useState, useEffect, useMemo } from 'react';
import TarjetaEquipo from '../components/modals/ModalEquipo/tarjetaequipo.js';
import ModalEquipo from '../components/modals/ModalEquipo/ModalEquipo.js';
import TimelineEquipos from '../components/modals/TimelineEquipos.js';
import useEquipos from '../hooks/useEquipos.js';
import { useAuth } from '../context/AuthContext.js';

const ITEMS_POR_PAGINA = 20;

export default function Equipos() {
  const { token } = useAuth();
  const { equipos, editar, loading, error } = useEquipos(token);

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [mostrarTimeline, setMostrarTimeline] = useState(false);
  const [orden, setOrden] = useState('aleatorio');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);

  // 🔎 Filtrar por tipo
  const equiposFiltrados = useMemo(() => {
    if (filtroTipo === 'selecciones') {
      return equipos.filter(e => e.esSeleccionNacional);
    }
    if (filtroTipo === 'clubes') {
      return equipos.filter(e => !e.esSeleccionNacional);
    }
    return equipos;
  }, [equipos, filtroTipo]);

  // 🔢 Ordenar equipos
  const equiposOrdenados = useMemo(() => {
    const lista = [...equiposFiltrados];
    switch (orden) {
      case 'nombre_asc':
        return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre_desc':
        return lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  }, [equiposFiltrados, orden]);

  // 📄 Paginación
  const totalPaginas = Math.ceil(equiposOrdenados.length / ITEMS_POR_PAGINA);
  const equiposPagina = equiposOrdenados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const renderPaginacion = () => (
    <nav className="flex flex-wrap justify-center mt-6 gap-2">
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
        <button
          key={numero}
          onClick={() => setPaginaActual(numero)}
          disabled={numero === paginaActual}
          className={`px-3 py-1 rounded-lg border ${
            numero === paginaActual
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
          }`}
        >
          {numero}
        </button>
      ))}
    </nav>
  );

  const handleOrdenChange = (e) => {
    setOrden(e.target.value);
    setPaginaActual(1);
  };

  const handleFiltroChange = (e) => {
    setFiltroTipo(e.target.value);
    setPaginaActual(1);
  };

  return (
    <div className="p-4 ">
      <div className="selector">
        {/* Ordenar */}
        <div>
          <label htmlFor="orden" className="block mb-1 font-semibold text-gray-700">Ordenar por:</label>
          <select
            id="orden"
            value={orden}
            onChange={handleOrdenChange}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="aleatorio">Aleatorio</option>
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
          </select>
        </div>

        {/* Filtro tipo */}
        <div>
          <label htmlFor="filtroTipo" className="block mb-1 font-semibold text-gray-700">Filtrar por tipo:</label>
          <select
            id="filtroTipo"
            value={filtroTipo}
            onChange={handleFiltroChange}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos</option>
            <option value="selecciones">Selecciones Nacionales</option>
            <option value="clubes">Clubes / Otros</option>
          </select>
        </div>

        {/* Botón Timeline */}
        <div className="flex items-end">
          <button
            onClick={() => setMostrarTimeline(true)}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            📅 Ver Timeline Histórico
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-500">Cargando equipos...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="lista px-0" aria-live="polite">
        {equiposPagina.map((equipo) => (
          <TarjetaEquipo
            key={equipo._id}
            nombre={equipo.nombre}
            escudo={equipo.escudo}
            onClick={() => setEquipoSeleccionado(equipo)}
          />
        ))}
      </div>

      {renderPaginacion()}

      {equipoSeleccionado && (
        <ModalEquipo
          equipo={equipoSeleccionado}
          onClose={() => setEquipoSeleccionado(null)}
          onEditarEquipo={editar}
        />
      )}

      {mostrarTimeline && (
        <TimelineEquipos
          onClose={() => setMostrarTimeline(false)}
        />
      )}
    </div>
  );
}
