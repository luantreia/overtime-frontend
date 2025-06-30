import React, { useState, useEffect } from 'react';
import { useCompetencias } from '../hooks/useCompetencias';
import TarjetaCompetencia from '../components/modals/ModalCompetencia/TarjetaCompetencia';
import ModalCompetencia from '../components/modals/ModalCompetencia/ModalCompetencia';

export default function Competencias() {
  const {
    competencias,
    loading,
    error,
    cargarCompetencias,
    eliminarCompetenciaPorId,
    actualizarCompetenciaPorId,
  } = useCompetencias();

  const [orden, setOrden] = useState('nombre_asc');
  const [competenciasOrdenadas, setCompetenciasOrdenadas] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState(null);

  const itemsPorPagina = 10;

  useEffect(() => {
    cargarCompetencias(); // Al montar
  }, []);

  useEffect(() => {
    if (competencias.length > 0) {
      const ordenadas = ordenarCompetencias([...competencias], orden);
      setCompetenciasOrdenadas(ordenadas);
      setPaginaActual(1); // Reinicia al cambiar orden
    }
  }, [competencias, orden]);

  const ordenarCompetencias = (lista, criterio) => {
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

  const indiceUltimo = paginaActual * itemsPorPagina;
  const indiceInicio = indiceUltimo - itemsPorPagina;
  const competenciasPagina = competenciasOrdenadas.slice(indiceInicio, indiceUltimo);
  const totalPaginas = Math.ceil(competenciasOrdenadas.length / itemsPorPagina);

  const renderPaginacion = () => {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
      <button
        key={num}
        onClick={() => setPaginaActual(num)}
        disabled={num === paginaActual}
        className={`px-3 py-1 rounded border text-sm mx-1 ${
          num === paginaActual
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white hover:bg-blue-100 border-gray-300'
        }`}
      >
        {num}
      </button>
    ));
  };

  return (
    <div className="p-2">
      <div className="selector mb-4">
        <label htmlFor="orden" className="block mb-2 font-semibold text-gray-700">
          Ordenar por:
        </label>
        <select
          id="orden"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="aleatorio">Orden aleatorio</option>
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="nombre_desc">Nombre (Z-A)</option>
        </select>
      </div>

      {loading && <p className="text-gray-600">Cargando competencias...</p>}
      {error && <p className="text-red-600 font-semibold">Error: {error}</p>}

      <div className="lista px-0" aria-live="polite">        
        {competenciasPagina.map((comp) => (
          <TarjetaCompetencia
            key={comp._id}
            nombre={comp.nombre}
            descripcion={comp.descripcion}
            onClick={() => setCompetenciaSeleccionada(comp)}
          />
        ))}
      </div>

      {totalPaginas > 1 && (
        <nav
          aria-label="Paginación de competencias"
          className="text-center mt-6 mb-10"
        >
          {renderPaginacion()}
        </nav>
      )}

      {competenciaSeleccionada && (
        <ModalCompetencia
          competenciaId={competenciaSeleccionada._id}
          onClose={() => setCompetenciaSeleccionada(null)}
          onActualizar={actualizarCompetenciaPorId}
          onEliminar={eliminarCompetenciaPorId}
        />
      )}
    </div>
  );
}
