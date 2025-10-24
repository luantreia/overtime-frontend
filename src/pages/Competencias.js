import React, { useState, useEffect, useMemo } from 'react';
import { Card, FilterControls, Spinner } from '../components/ui';
import { useCompetencias } from '../hooks/competencias/useCompetencias';
import { useAuth } from '../context/AuthContext';
import { ITEMS_PER_PAGE } from '../utils/constants';
import { formatNumber } from '../utils/formatters';
import { CompetenciaCard, ModalCompetencia } from '../components/features/competencias';
import ModalCompetenciaAdmin from '../components/features/admin/competencias/components/ModalCompetenciaAdmin';

export default function Competencias() {
  const { token, user, rol } = useAuth();
  const {
    competencias,
    loading,
    error,
    cargarCompetencias,
    eliminarCompetenciaPorId,
    actualizarCompetenciaPorId,
  } = useCompetencias(token);

  const [orden, setOrden] = useState('nombre_asc');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState(null);
  const [competenciaAdminId, setCompetenciaAdminId] = useState(null);

  // Filtrar competencias
  const competenciasFiltradas = useMemo(() => {
    let filtered = competencias;

    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(competencia => competencia.tipo === filtroTipo);
    }

    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(competencia => competencia.estado === filtroEstado);
    }

    return filtered;
  }, [competencias, filtroTipo, filtroEstado]);

  // Ordenar competencias
  const competenciasOrdenadas = useMemo(() => {
    const lista = [...competenciasFiltradas];
    switch (orden) {
      case 'nombre_asc':
        return lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      case 'nombre_desc':
        return lista.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  }, [competenciasFiltradas, orden]);

  // Paginación
  const totalPaginas = Math.ceil(competenciasOrdenadas.length / ITEMS_PER_PAGE);
  const competenciasPagina = competenciasOrdenadas.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Estadísticas rápidas
  const estadisticasCompetencias = useMemo(() => {
    const total = competencias.length;
    const activas = competencias.filter(c => c.estado === 'activa').length;
    const finalizadas = competencias.filter(c => c.estado === 'finalizada').length;
    const temporadasTotal = competencias.reduce((acc, c) => acc + (c.temporadas?.length || 0), 0);

    return { total, activas, finalizadas, temporadasTotal };
  }, [competencias]);

  // Configuración de filtros
  const filters = [
    {
      key: 'tipo',
      label: 'Tipo',
      value: filtroTipo,
      options: [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'liga', label: 'Liga' },
        { value: 'torneo', label: 'Torneo' },
        { value: 'copa', label: 'Copa' }
      ]
    },
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todos', label: 'Todos los estados' },
        { value: 'activa', label: 'Activas' },
        { value: 'finalizada', label: 'Finalizadas' },
        { value: 'programada', label: 'Programadas' },
        { value: 'cancelada', label: 'Canceladas' }
      ]
    }
  ];

  if (loading) {
    return <Spinner size="lg" message="Cargando competencias..." />;
  }

  if (error) {
    return (
      <Card variant="danger">
        <p>Error al cargar competencias: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header limpio con menú de filtros/orden */}
      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Competencias ({formatNumber(competenciasFiltradas.length)})
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
                      if (key === 'tipo') setFiltroTipo(value);
                      if (key === 'estado') setFiltroEstado(value);
                      setPaginaActual(1);
                    }}
                    onClearFilters={() => {
                      setFiltroTipo('todos');
                      setFiltroEstado('todos');
                      setPaginaActual(1);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="orden" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por</label>
                  <select
                    id="orden"
                    value={orden}
                    onChange={(e) => { setOrden(e.target.value); setPaginaActual(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="nombre_asc">Nombre A-Z</option>
                    <option value="nombre_desc">Nombre Z-A</option>
                    <option value="aleatorio">Orden aleatorio</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    setFiltroTipo('todos');
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

      {/* Grid de competencias */}
      {competenciasPagina.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competenciasPagina.map((competencia) => (
            <CompetenciaCard
              key={competencia._id}
              competencia={competencia}
              onClick={() => setCompetenciaSeleccionada(competencia)}
              isAdmin={user && (
                competencia.creadoPor === user.uid ||
                (competencia.administradores && competencia.administradores.includes(user.uid)) ||
                rol === 'admin'
              )}
              onAdminClick={() => setCompetenciaAdminId(competencia._id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay competencias disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron competencias con los filtros aplicados.
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

      {/* Modal de competencia (vista) */}
      {competenciaSeleccionada && (
        <ModalCompetencia
          competencia={competenciaSeleccionada}
          onClose={() => setCompetenciaSeleccionada(null)}
        />
      )}

      {/* Modal de administración de competencia */}
      {competenciaAdminId && (
        <ModalCompetenciaAdmin
          competenciaId={competenciaAdminId}
          token={token}
          onClose={() => setCompetenciaAdminId(null)}
        />
      )}
    </div>
  );
}
