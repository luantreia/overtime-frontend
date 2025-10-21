import React, { useState, useEffect, useMemo } from 'react';
import TarjetaPartido from '../components/modals/ModalPartido/TarjetaPartido.js';
import ModalPartido from '../components/modals/ModalPartido/Modalpartido.js';
import ModalPartidoAdmin from '../components/user/perfil/Admin/AdminPartido/ModalPartidoAdmin.js';
import { usePartidos } from '../hooks/partidos/usePartidos.js';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { diagnosticTest } from '../utils/diagnostic';

export default function Partidos() {
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [partidoAdminSeleccionado, setPartidoAdminSeleccionado] = useState(null);
  const [ordenLista, setOrdenLista] = useState('aleatorio');
  const [paginaActual, setPaginaActual] = useState(1);
  const [authError, setAuthError] = useState(null);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const itemsPorPagina = 20;

  const { token, user, rol } = useAuth();
  const {
    partidos,
    cargando,
    error,
    agregarSetAPartido,
    actualizarSetDePartido,
    eliminarPartidoPorId,
    cargarPartidoPorId,
    editarPartidoExistente,
    eliminarSetDePartido
  } = usePartidos(token, ordenLista);

  // Detectar errores de autenticación y ejecutar diagnóstico
  useEffect(() => {
    if (error && error.message && error.message.includes('401')) {
      console.log('🚨 Error 401 detectado, ejecutando diagnóstico...');
      setAuthError('Error de autenticación. Verifica tu conexión e intenta recargar la página.');
      diagnosticTest(token).then(results => {
        setDiagnosticResults(results);
      });
    } else if (error) {
      setAuthError(null); // Limpiar error de auth si no es 401
    }
  }, [error, token]);

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

  const handleAdminPartido = (partido) => {
    setPartidoAdminSeleccionado(partido);
  };

  // 🎯 Optimización con useMemo para cálculos costosos
  const partidosOrdenados = useMemo(() => {
    if (!partidos || partidos.length === 0) return [];

    const listaOrdenada = [...partidos];

    switch (ordenLista) {
      case 'fecha_desc':
        return listaOrdenada.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      case 'fecha_asc':
        return listaOrdenada.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      case 'estado':
        return listaOrdenada.sort((a, b) => {
          const estadoA = a.estadoPartido || 'pendiente';
          const estadoB = b.estadoPartido || 'pendiente';
          return estadoA.localeCompare(estadoB);
        });
      case 'aleatorio':
      default:
        // Para aleatorio, solo reordenar cuando cambie la lista de partidos
        return listaOrdenada.sort(() => Math.random() - 0.5);
    }
  }, [partidos, ordenLista]);

  // 📄 Optimización de paginación con useMemo
  const totalPaginas = useMemo(() =>
    Math.ceil(partidosOrdenados.length / itemsPorPagina),
    [partidosOrdenados.length, itemsPorPagina]
  );

  const partidosPagina = useMemo(() => {
    const indiceInicio = (paginaActual - 1) * itemsPorPagina;
    return partidosOrdenados.slice(indiceInicio, indiceInicio + itemsPorPagina);
  }, [partidosOrdenados, paginaActual, itemsPorPagina]);

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

      {cargando ? (
        <LoadingSpinner size="large" message="Cargando partidos..." />
      ) : authError ? (
        <div className="text-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error de Autenticación</h3>
            <p className="text-red-700 mb-4">{authError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Recargar Página
            </button>
          </div>

          {diagnosticResults && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-2xl mx-auto">
              <h4 className="font-semibold text-gray-800 mb-3">Resultados del Diagnóstico:</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(diagnosticResults).map(([test, result]) => (
                  <div key={test} className="flex justify-between">
                    <span className="font-medium">{test}:</span>
                    <span className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                      {result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 justify-items-center">
          {partidosPagina.map((p) => (
            <div key={p._id} className="w-full max-w-xs">
              <TarjetaPartido
                partido={p}
                onClick={() => handleSeleccionarPartido(p)}
                onAdminClick={handleAdminPartido}
                user={user}
                rol={rol}
              />
            </div>
          ))}
        </div>
      )}

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
        />
      )}

      {partidoAdminSeleccionado && (
        <ModalPartidoAdmin
          partidoId={partidoAdminSeleccionado._id}
          token={token}
          onClose={() => setPartidoAdminSeleccionado(null)}
          onPartidoEliminado={eliminarPartidoPorId}
        />
      )}
    </div>
  );
}
