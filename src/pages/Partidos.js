import React, { useState, useEffect } from 'react';
import TarjetaPartido from '../components/modals/ModalPartido/TarjetaPartido.js';
import ModalPartido from '../components/modals/ModalPartido/Modalpartido.js';
import { usePartidos } from '../hooks/usePartidos.js';
import { useAuth } from '../context/AuthContext';

export default function Partidos() {
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [ordenLista, setOrdenLista] = useState('aleatorio');
  const [partidosOrdenados, setPartidosOrdenados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  const { token } = useAuth();
  const {
    partidos,
    cargando,
    agregarSetAPartido,
    actualizarSetDePartido,
    eliminarPartidoPorId,
    cargarPartidoPorId,
    eliminarSetDePartido
  } = usePartidos(token, ordenLista);

  useEffect(() => {
    if (partidos.length > 0) {
      const ordenados = ordenarPartidos([...partidos], ordenLista);
      setPartidosOrdenados(ordenados);
      setPaginaActual(1); // Reiniciar página al cambiar orden
    }
  }, [partidos, ordenLista]);

  const ordenarPartidos = (lista, criterio) => {
    switch (criterio) {
      case 'fecha_asc':
        return lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      case 'fecha_desc':
        return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      case 'estado':
        return lista.sort((a, b) => a.estado.localeCompare(b.estado));
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  };

  const refrescarPartidoSeleccionado = async () => {
    if (!partidoSeleccionado) return;
    const refreshed = await cargarPartidoPorId(partidoSeleccionado._id);
    setPartidoSeleccionado(refreshed);
  };

  const handleOrdenChange = (e) => {
    setOrdenLista(e.target.value);
  };

  const handleSeleccionarPartido = async (partido) => {
    const partidoCompleto = await cargarPartidoPorId(partido._id);
    setPartidoSeleccionado(partidoCompleto || partido);
  };

  const totalPaginas = Math.ceil(partidosOrdenados.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const partidosPagina = partidosOrdenados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPaginaActual(nueva);
    }
  };

  if (cargando) {
    return <p className="text-center mt-10">Cargando partidos...</p>;
  }

  return (
    <div className="p-2">
      <div className="selector" style={{ marginBottom: 16 }}>
        <label htmlFor="orden" className="block mb-2 font-semibold text-gray-700">
          Ordenar por:
        </label>     
        <select
          id="orden"
          value={ordenLista}
          onChange={handleOrdenChange}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fecha_desc">Fecha (más reciente primero)</option>
          <option value="fecha_asc">Fecha (más antigua primero)</option>
          <option value="estado">Estado</option>
          <option value="aleatorio">Orden aleatorio</option>
        </select>
      </div>

      <div className="lista px-0">
        {partidosPagina.map((p) => (
          <TarjetaPartido key={p._id} partido={p} onClick={() => handleSeleccionarPartido(p)} />
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2 flex-wrap">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => cambiarPagina(num)}
              className={`px-3 py-1 rounded border ${
                num === paginaActual
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-blue-100'
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {partidoSeleccionado && (
        <ModalPartido
          partido={partidoSeleccionado}
          onClose={() => setPartidoSeleccionado(null)}
          token={token}
          agregarSetAPartido={agregarSetAPartido}
          actualizarSetDePartido={actualizarSetDePartido}
          cargarPartidoPorId={cargarPartidoPorId}
          eliminarSetDePartido={eliminarSetDePartido}
          refrescarPartidoSeleccionado={refrescarPartidoSeleccionado}
        />
      )}
    </div>
  );
}
