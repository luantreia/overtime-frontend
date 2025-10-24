// src/pages/Jugadores.js
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Spinner, FilterControls } from '../components/ui';
import { JugadorCard, ModalJugador } from '../components/features/jugadores';
import ModalJugadorAdmin from '../components/features/admin/jugadores/components/ModalJugadorAdmin.jsx';
import useJugadores from '../hooks/jugadores/useJugadores';
import { useAuth } from '../context/AuthContext';
import { ITEMS_PER_PAGE } from '../utils/constants';
import { formatNumber } from '../utils/formatters';
import { fetchEquipos } from '../services/equipoService';
import { fetchJugadoresPorEquipo } from '../services/jugadorService';

export default function Jugadores() {
  const { token, user, rol } = useAuth();
  const { jugadores, loading, error } = useJugadores(token);

  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [orden, setOrden] = useState('aleatorio');
  const [filtroEquipo, setFiltroEquipo] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [equiposLista, setEquiposLista] = useState([]);
  const [jugadoresFuente, setJugadoresFuente] = useState([]);
  const [loadingFiltro, setLoadingFiltro] = useState(false);
  const [jugadorAdminSeleccionado, setJugadorAdminSeleccionado] = useState(null);

  // Cargar equipos para el filtro
  useEffect(() => {
    let cancelado = false;
    async function cargarEquipos() {
      try {
        const equipos = await fetchEquipos(token);
        if (!cancelado) setEquiposLista(Array.isArray(equipos) ? equipos : []);
      } catch (_) {
        if (!cancelado) setEquiposLista([]);
      }
    }
    cargarEquipos();
    return () => { cancelado = true; };
  }, [token]);

  // Inicializar fuente cuando no hay filtro
  useEffect(() => {
    if (filtroEquipo === 'todos') {
      setJugadoresFuente(jugadores);
    }
  }, [jugadores, filtroEquipo]);

  const handleOrdenChange = (e) => {
    setOrden(e.target.value);
    setPaginaActual(1);
  };

  // Lista base ya filtrada por backend (o todos)
  const jugadoresFiltrados = useMemo(() => {
    return [...jugadoresFuente];
  }, [jugadoresFuente]);

  // Ordenar jugadores
  const jugadoresOrdenados = useMemo(() => {
    const lista = [...jugadoresFiltrados];
    switch (orden) {
      case 'nombre_asc':
        return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre_desc':
        return lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'edad_asc':
        return lista.sort((a, b) => (a.edad || 0) - (b.edad || 0));
      case 'edad_desc':
        return lista.sort((a, b) => (b.edad || 0) - (a.edad || 0));
      case 'equipo':
        return lista.sort((a, b) =>
          (a.equipo?.nombre || '').localeCompare(b.equipo?.nombre || '')
        );
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  }, [jugadoresFiltrados, orden]);

  // Paginación
  const totalPaginas = Math.ceil(jugadoresOrdenados.length / ITEMS_PER_PAGE);
  const jugadoresPagina = jugadoresOrdenados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Opciones de equipos desde backend
  const opcionesEquipos = useMemo(() => {
    return [{ value: 'todos', label: 'Todos los equipos' },
      ...equiposLista.map(eq => ({ value: eq._id, label: eq.nombre }))
    ];
  }, [equiposLista]);


  const filters = [
    {
      key: 'equipo',
      label: 'Equipo',
      value: filtroEquipo,
      options: opcionesEquipos
    }
  ];

  if (loading) {
    return <Spinner size="lg" message="Cargando jugadores..." />;
  }

  if (error) {
    return (
      <Card variant="danger">
        <p>Error al cargar jugadores: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header simple con filtros y orden integrados */}
      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Jugadores ({formatNumber(jugadoresFiltrados.length)})
          </h1>

          {/* Menú desplegable de filtros y orden para un header más limpio */}
          <details className="relative">
            <summary className="cursor-pointer select-none px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
              Filtros y orden
            </summary>
            <div className="absolute right-0 mt-2 z-20 w-[min(92vw,560px)] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:bg-gray-900 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FilterControls
                    filters={filters}
                    onFilterChange={async (key, value) => {
                      if (key === 'equipo') {
                        setFiltroEquipo(value);
                        setPaginaActual(1);
                        if (value === 'todos') {
                          setJugadoresFuente(jugadores);
                        } else {
                          try {
                            setLoadingFiltro(true);
                            const lista = await fetchJugadoresPorEquipo(value, token);
                            if (Array.isArray(lista) && lista.length > 0) {
                              setJugadoresFuente(lista);
                            } else {
                              // Fallback local si el endpoint no devuelve jugadores
                              const local = Array.isArray(jugadores)
                                ? jugadores.filter(j => (j.equipo?._id || j.equipo) === value)
                                : [];
                              setJugadoresFuente(local);
                            }
                          } catch (_) {
                            setJugadoresFuente([]);
                          } finally {
                            setLoadingFiltro(false);
                          }
                        }
                      }
                    }}
                    onClearFilters={() => {
                      setFiltroEquipo('todos');
                      setPaginaActual(1);
                      setJugadoresFuente(jugadores);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="orden" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por</label>
                  <select
                    id="orden"
                    value={orden}
                    onChange={handleOrdenChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="nombre_asc">Nombre (A-Z)</option>
                    <option value="nombre_desc">Nombre (Z-A)</option>
                    <option value="edad_asc">Edad (menor a mayor)</option>
                    <option value="edad_desc">Edad (mayor a menor)</option>
                    <option value="equipo">Equipo</option>
                    <option value="aleatorio">Orden aleatorio</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setFiltroEquipo('todos');
                    setPaginaActual(1);
                  }}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                >
                  Limpiar filtros
                </button>
              </div>
              {loadingFiltro && (
                <div className="mt-3 text-xs text-gray-500">Cargando jugadores del equipo…</div>
              )}
            </div>
          </details>
        </div>
      </Card>

      {/* Grid de jugadores */}
      {jugadoresPagina.length > 0 ? (
        <div className={`grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 justify-items-center`}>
          {jugadoresPagina.map((jugador) => (
            <div key={jugador._id} className={`w-full max-w-[140px]`}>
              <JugadorCard
                jugador={jugador}
                onClick={() => setJugadorSeleccionado(jugador)}
                showStats={true}
                onAdminClick={() => setJugadorAdminSeleccionado(jugador)}
                user={user}
                rol={rol}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay jugadores disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron jugadores con los filtros aplicados.
            </p>
          </div>
        </Card>
      )}

      {/* Paginación mejorada */}
      {totalPaginas > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
            <button
              key={numero}
              onClick={() => setPaginaActual(numero)}
              disabled={numero === paginaActual}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                numero === paginaActual
                  ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              {numero}
            </button>
          ))}
        </div>
      )}

      {/* Modal de jugador usando nuevo módulo */}
      {jugadorSeleccionado && (
        <ModalJugador
          jugador={jugadorSeleccionado}
          onClose={() => setJugadorSeleccionado(null)}
        />
      )}

      {jugadorAdminSeleccionado && (
        <ModalJugadorAdmin
          jugadorId={jugadorAdminSeleccionado._id}
          token={token}
          onClose={() => setJugadorAdminSeleccionado(null)}
        />
      )}
    </div>
  );
}
