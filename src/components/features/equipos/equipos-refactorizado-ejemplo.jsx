// Ejemplo de cómo se vería la página de Equipos refactorizada

// ✅ IMPORTACIONES NUEVAS:
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, FilterControls, Spinner } from '../ui';
import { TarjetaEquipo, ModalEquipo } from '../features/equipos';
import { useEquipos } from '../hooks/equipos/useEquipos';
import { useAuth } from '../context/AuthContext';
import { ITEMS_PER_PAGE, EQUIPO_TYPES } from '../utils/constants';
import { formatNumber } from '../utils/formatters';

// ✅ COMPONENTE MEJORADO:
export default function EquiposRefactorizado() {
  const { token } = useAuth();
  const { equipos, loading, error } = useEquipos(token);

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [mostrarTimeline, setMostrarTimeline] = useState(false);

  // Filtros usando constantes
  const [filtroTipo, setFiltroTipo] = useState(EQUIPO_TYPES.TODOS);
  const [paginaActual, setPaginaActual] = useState(1);

  const equiposFiltrados = useMemo(() => {
    if (filtroTipo === EQUIPO_TYPES.TODOS) return equipos;

    return equipos.filter(equipo =>
      filtroTipo === EQUIPO_TYPES.SELECCIONES
        ? equipo.esSeleccionNacional
        : !equipo.esSeleccionNacional
    );
  }, [equipos, filtroTipo]);

  const totalPaginas = Math.ceil(equiposFiltrados.length / ITEMS_PER_PAGE);
  const equiposPagina = equiposFiltrados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Configuración de filtros
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
      {/* Header con estadísticas */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Equipos ({formatNumber(equiposFiltrados.length)})
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestión de equipos de dodgeball
            </p>
          </div>
          <Badge variant="primary" size="lg">
            {equiposFiltrados.filter(e => e.esSeleccionNacional).length} selecciones
          </Badge>
        </div>
      </Card>

      {/* Controles de filtro */}
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

      {/* Grid de equipos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {equiposPagina.map((equipo) => (
          <EquipoCard
            key={equipo._id}
            equipo={equipo}
            onClick={() => setEquipoSeleccionado(equipo)}
            showStats={true}
          />
        ))}
      </div>

      {/* Paginación mejorada */}
      {totalPaginas > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
            <Button
              key={numero}
              variant={numero === paginaActual ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPaginaActual(numero)}
            >
              {numero}
            </Button>
          ))}
        </div>
      )}

      {/* Modal de equipo */}
      {equipoSeleccionado && (
        <ModalEquipo
          equipo={equipoSeleccionado}
          onClose={() => setEquipoSeleccionado(null)}
        />
      )}
    </div>
  );
}
