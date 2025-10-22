import React, { useState, useEffect, useMemo } from 'react';
import { Card, FilterControls, Spinner } from '../components/ui';
import { PartidoCard } from '../components/features/partidos';
import ModalPartidoAdmin from '../components/features/admin/partidos/components/ModalPartidoAdmin';
import ModalPartido from '../components/features/partidos/ModalPartido';
import { usePartidos } from '../hooks/partidos/usePartidos.js';
import { useAuth } from '../context/AuthContext';
import { ITEMS_PER_PAGE, PARTIDO_ESTADOS } from '../utils/constants';
import { formatDate, formatNumber } from '../utils/formatters';
import { normalizeEquipoNombre } from '../utils/partidoUtils';

export default function Partidos() {
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [partidoAdminId, setPartidoAdminId] = useState(null);
  const [ordenLista, setOrdenLista] = useState('fecha_desc');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);

  const { token, user, rol } = useAuth();
  const {
    partidos,
    cargando,
    error
  } = usePartidos(token, ordenLista);

  // Filtrar partidos
  const partidosFiltrados = useMemo(() => {
    if (filtroEstado === 'todos') return partidos;
    return partidos.filter(partido => partido.estado === filtroEstado);
  }, [partidos, filtroEstado]);

  // Ordenar partidos
  const partidosOrdenados = useMemo(() => {
    const lista = [...partidosFiltrados];
    switch (ordenLista) {
      case 'fecha_asc':
        return lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      case 'fecha_desc':
        return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  }, [partidosFiltrados, ordenLista]);

  // Paginación
  const totalPaginas = Math.ceil(partidosOrdenados.length / ITEMS_PER_PAGE);
  const partidosPagina = partidosOrdenados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Estadísticas rápidas
  const estadisticasPartidos = useMemo(() => {
    const total = partidos.length;
    const programados = partidos.filter(p => p.estado === PARTIDO_ESTADOS.PROGRAMADO).length;
    const enVivo = partidos.filter(p => p.estado === PARTIDO_ESTADOS.EN_VIVO).length;
    const finalizados = partidos.filter(p => p.estado === PARTIDO_ESTADOS.FINALIZADO).length;
    const cancelados = partidos.filter(p => p.estado === PARTIDO_ESTADOS.CANCELADO).length;

    return { total, programados, enVivo, finalizados, cancelados };
  }, [partidos]);

  // Configuración de filtros
  const filters = [
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todos', label: 'Todos los partidos' },
        { value: PARTIDO_ESTADOS.PROGRAMADO, label: 'Programados' },
        { value: PARTIDO_ESTADOS.EN_VIVO, label: 'En vivo' },
        { value: PARTIDO_ESTADOS.FINALIZADO, label: 'Finalizados' },
        { value: PARTIDO_ESTADOS.CANCELADO, label: 'Cancelados' }
      ]
    }
  ];

  // Determinar si el usuario puede administrar partidos
  const puedeAdministrar = (partido) => {
    return user && (
      partido.creadoPor === user.uid ||
      (partido.administradores && partido.administradores.includes(user.uid)) ||
      rol === 'admin'
    );
  };

  if (cargando) {
    return <Spinner size="lg" message="Cargando partidos..." />;
  }

  if (error) {
    return (
      <Card variant="danger">
        <p>Error al cargar partidos: {error.message || error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header limpio con menú de filtros/orden */}
      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Partidos ({formatNumber(partidosFiltrados.length)})
          </h1>

          <details className="relative">
            <summary className="cursor-pointer select-none px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
              Filtros y orden
            </summary>
            <div className="absolute right-0 mt-2 z-20 w-[min(92vw,560px)] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:bg-gray-900 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FilterControls
                    filters={filters}
                    onFilterChange={(key, value) => {
                      if (key === 'estado') setFiltroEstado(value);
                      setPaginaActual(1);
                    }}
                    onClearFilters={() => {
                      setFiltroEstado('todos');
                      setPaginaActual(1);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="ordenLista" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por</label>
                  <select
                    id="ordenLista"
                    value={ordenLista}
                    onChange={(e) => { setOrdenLista(e.target.value); setPaginaActual(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="fecha_desc">Más recientes primero</option>
                    <option value="fecha_asc">Más antiguos primero</option>
                    <option value="aleatorio">Orden aleatorio</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setFiltroEstado('todos');
                    setPaginaActual(1);
                  }}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </details>
        </div>
      </Card>

      {/* Grid de partidos */}
      {partidosPagina.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partidosPagina.map((partido) => (
            <PartidoCard
              key={partido._id}
              partido={partido}
              onClick={() => setPartidoSeleccionado(partido)}
              isAdmin={puedeAdministrar(partido)}
              onAdminClick={() => setPartidoAdminId(partido._id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay partidos disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron partidos con los filtros aplicados.
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

      {/* Modal de partido: versión completa */}
      {partidoSeleccionado && (
        <ModalPartido
          partido={partidoSeleccionado}
          onClose={() => setPartidoSeleccionado(null)}
        />
      )}

      {/* Modal de administración de partido */}
      {partidoAdminId && (
        <ModalPartidoAdmin
          partidoId={partidoAdminId}
          token={token}
          onClose={() => setPartidoAdminId(null)}
          onPartidoEliminado={() => {
            setPartidoAdminId(null);
          }}
        />
      )}
    </div>
  );
}
