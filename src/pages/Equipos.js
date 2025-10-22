import React, { useState, useEffect, useMemo } from 'react';
import { Card, FilterControls, Spinner } from '../components/ui';
import { TarjetaEquipo, ModalEquipo } from '../components/features/equipos';
import TimelineEquipos from '../components/common/timeline/TimelineEquipos.js';
import { useEquipos } from '../hooks/equipos/useEquipos.js';
import { useAuth } from '../context/AuthContext.js';
import { ITEMS_PER_PAGE, EQUIPO_TYPES } from '../utils/constants';
import { formatNumber } from '../utils/formatters';

export default function Equipos() {
  const { token } = useAuth();
  const { equipos, editar, loading, error } = useEquipos(token);

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [mostrarTimeline, setMostrarTimeline] = useState(false);
  const [orden, setOrden] = useState('aleatorio');
  const [filtroTipo, setFiltroTipo] = useState(EQUIPO_TYPES.TODOS);
  const [paginaActual, setPaginaActual] = useState(1);

  // Filtrar equipos usando constantes
  const equiposFiltrados = useMemo(() => {
    if (filtroTipo === EQUIPO_TYPES.TODOS) return equipos;

    return equipos.filter(equipo =>
      filtroTipo === EQUIPO_TYPES.SELECCIONES
        ? equipo.esSeleccionNacional
        : !equipo.esSeleccionNacional
    );
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
  const totalPaginas = Math.ceil(equiposOrdenados.length / ITEMS_PER_PAGE);
  const equiposPagina = equiposOrdenados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Estadísticas rápidas
  const estadisticasEquipos = useMemo(() => {
    const total = equipos.length;
    const selecciones = equipos.filter(e => e.esSeleccionNacional).length;
    const clubes = total - selecciones;
    const activos = equipos.filter(e => e.estaActivo).length;

    return { total, selecciones, clubes, activos };
  }, [equipos]);

  // Configuración de filtros usando constantes
  const filters = [
    {
      key: 'tipo',
      label: 'Tipo de equipo',
      value: filtroTipo,
      options: [
        { value: EQUIPO_TYPES.TODOS, label: 'Todos los equipos' },
        { value: EQUIPO_TYPES.SELECCIONES, label: 'Selecciones' },
        { value: EQUIPO_TYPES.CLUBES, label: 'Clubes' }
      ]
    }
  ];

  if (loading) {
    return <Spinner size="lg" message="Cargando equipos..." />;
  }

  if (error) {
    return (
      <Card variant="danger">
        <p>Error al cargar equipos: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header limpio con menú de filtros/orden y acceso a timeline */}
      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Equipos ({formatNumber(equiposFiltrados.length)})
          </h1>

          <div className="flex items-center gap-3">
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
                        setPaginaActual(1);
                      }}
                      onClearFilters={() => {
                        setFiltroTipo(EQUIPO_TYPES.TODOS);
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
                      setFiltroTipo(EQUIPO_TYPES.TODOS);
                      setPaginaActual(1);
                    }}
                    className="px-3 py-1.5 rounded-md border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </details>

            <button
              onClick={() => setMostrarTimeline(true)}
              className="px-3 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 transition-colors"
            >
              📅 Timeline
            </button>
          </div>
        </div>
      </Card>

      {/* Grid de equipos */}
      {equiposPagina.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 justify-items-center">
          {equiposPagina.map((equipo) => (
            <div key={equipo._id} className="w-full max-w-[140px]">
              <TarjetaEquipo
                nombre={equipo.nombre}
                escudo={equipo.escudo}
                onClick={() => setEquipoSeleccionado(equipo)}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay equipos disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron equipos con los filtros aplicados.
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

      {/* Modal de equipo usando nuevo módulo */}
      {equipoSeleccionado && (
        <ModalEquipo
          equipo={equipoSeleccionado}
          onClose={() => setEquipoSeleccionado(null)}
          onEditarEquipo={editar}
        />
      )}

      {/* Timeline usando componente existente */}
      {mostrarTimeline && (
        <TimelineEquipos
          onClose={() => setMostrarTimeline(false)}
        />
      )}
    </div>
  );
}
