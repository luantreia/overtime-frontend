import React, { useState, useEffect, useMemo } from 'react';
import { Card, FilterControls, Spinner, Badge } from '../components/ui';
import { useOrganizaciones } from '../hooks/organizaciones/useOrganizaciones';
import { useAuth } from '../context/AuthContext';
import { ITEMS_PER_PAGE } from '../utils/constants';
import { formatNumber } from '../utils/formatters';

export default function Organizaciones() {
  const { token } = useAuth();
  const { organizaciones, loading, error, agregarOrganizacion, cargarOrganizaciones } = useOrganizaciones(token);

  const [orden, setOrden] = useState('nombre_asc');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [organizacionSeleccionada, setOrganizacionSeleccionada] = useState(null);

  // Filtrar organizaciones
  const organizacionesFiltradas = useMemo(() => {
    let filtered = organizaciones;

    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(organizacion =>
        filtroEstado === 'activas' ? organizacion.activa : !organizacion.activa
      );
    }

    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(organizacion =>
        organizacion.tipo === filtroTipo
      );
    }

    return filtered;
  }, [organizaciones, filtroEstado, filtroTipo]);

  // Ordenar organizaciones
  const organizacionesOrdenadas = useMemo(() => {
    const lista = [...organizacionesFiltradas];
    switch (orden) {
      case 'nombre_asc':
        return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'nombre_desc':
        return lista.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case 'aleatorio':
      default:
        return lista.sort(() => Math.random() - 0.5);
    }
  }, [organizacionesFiltradas, orden]);

  // Paginación
  const totalPaginas = Math.ceil(organizacionesOrdenadas.length / ITEMS_PER_PAGE);
  const organizacionesPagina = organizacionesOrdenadas.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Estadísticas rápidas
  const estadisticasOrganizaciones = useMemo(() => {
    const total = organizaciones.length;
    const activas = organizaciones.filter(o => o.activa).length;
    const conCompetencias = organizaciones.filter(o => o.competencias?.length > 0).length;
    const conEquipos = organizaciones.filter(o => o.equipos?.length > 0).length;

    return { total, activas, conCompetencias, conEquipos };
  }, [organizaciones]);

  // Configuración de filtros
  const filters = [
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todos', label: 'Todas las organizaciones' },
        { value: 'activas', label: 'Activas' },
        { value: 'inactivas', label: 'Inactivas' }
      ]
    },
    {
      key: 'tipo',
      label: 'Tipo',
      value: filtroTipo,
      options: [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'federacion', label: 'Federación' },
        { value: 'liga', label: 'Liga' },
        { value: 'club', label: 'Club' },
        { value: 'asociacion', label: 'Asociación' }
      ]
    }
  ];

  if (loading) {
    return <Spinner size="lg" message="Cargando organizaciones..." />;
  }

  if (error) {
    return (
      <Card variant="danger">
        <p>Error al cargar organizaciones: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header limpio con menú de filtros/orden */}
      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Organizaciones ({formatNumber(organizacionesFiltradas.length)})
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
                      if (key === 'tipo') setFiltroTipo(value);
                      setPaginaActual(1);
                    }}
                    onClearFilters={() => {
                      setFiltroEstado('todos');
                      setFiltroTipo('todos');
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
                    setFiltroEstado('todos');
                    setFiltroTipo('todos');
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

      {/* Grid de organizaciones */}
      {organizacionesPagina.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizacionesPagina.map((organizacion) => (
            <Card key={organizacion._id} className="hover:shadow-lg transition-all duration-200">
              <div className="space-y-4">
                {/* Header con nombre y estado */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {organizacion.nombre}
                  </h3>
                  <Badge variant={organizacion.activa ? 'success' : 'danger'}>
                    {organizacion.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                    <p className="font-medium capitalize">
                      {organizacion.tipo || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">País:</span>
                    <p className="font-medium">
                      {organizacion.pais || 'No especificado'}
                    </p>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                      {organizacion.competencias?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Competencias</div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                      {organizacion.equipos?.length || 0}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Equipos</div>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      {organizacion.jugadores?.length || 0}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Jugadores</div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Creada: {new Date(organizacion.fechaCreacion).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setOrganizacionSeleccionada(organizacion)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => {/* Editar organización */}}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {/* Eliminar organización */}}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay organizaciones disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron organizaciones con los filtros aplicados.
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

      {/* Modal de organización usando nuevo módulo */}
      {organizacionSeleccionada && (
        <div>
          {/* Aquí se implementaría el modal usando el módulo de organizaciones */}
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Organización Seleccionada</h3>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                {organizacionSeleccionada.nombre}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setOrganizacionSeleccionada(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
