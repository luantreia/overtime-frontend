// Ejemplo de página de Jugadores refactorizada con nueva estructura

// ✅ IMPORTACIONES NUEVAS Y LIMPIAS:
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, FilterControls, Spinner } from '../ui';
import { JugadorCard, ModalJugador } from '../features/jugadores';
import useJugadores from '../hooks/jugadores/useJugadores';
import { useAuth } from '../context/AuthContext';
import { ITEMS_PER_PAGE } from '../utils/constants';
import { formatNumber } from '../utils/formatters';

// ✅ COMPONENTE MEJORADO:
export default function JugadoresRefactorizado() {
  const { token } = useAuth();
  const { jugadores, loading, error } = useJugadores(token);

  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [filtroPosicion, setFiltroPosicion] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const jugadoresFiltrados = useMemo(() => {
    let filtered = jugadores;

    if (filtroEquipo) {
      filtered = filtered.filter(j => j.equipo?._id === filtroEquipo);
    }

    if (filtroPosicion) {
      filtered = filtered.filter(j => j.posicion === filtroPosicion);
    }

    return filtered;
  }, [jugadores, filtroEquipo, filtroPosicion]);

  const totalPaginas = Math.ceil(jugadoresFiltrados.length / ITEMS_PER_PAGE);
  const jugadoresPagina = jugadoresFiltrados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Obtener opciones únicas para filtros
  const equiposUnicos = useMemo(() => {
    const equipos = new Set();
    jugadores.forEach(j => {
      if (j.equipo?.nombre) equipos.add(j.equipo.nombre);
    });
    return Array.from(equipos).sort();
  }, [jugadores]);

  const posicionesUnicas = useMemo(() => {
    const posiciones = new Set();
    jugadores.forEach(j => {
      if (j.posicion) posiciones.add(j.posicion);
    });
    return Array.from(posiciones).sort();
  }, [jugadores]);

  // Configuración de filtros
  const filters = [
    {
      key: 'equipo',
      label: 'Equipo',
      value: filtroEquipo,
      options: [
        { value: '', label: 'Todos los equipos' },
        ...equiposUnicos.map(equipo => ({ value: equipo, label: equipo }))
      ]
    },
    {
      key: 'posicion',
      label: 'Posición',
      value: filtroPosicion,
      options: [
        { value: '', label: 'Todas las posiciones' },
        ...posicionesUnicas.map(posicion => ({ value: posicion, label: posicion }))
      ]
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
      {/* Header con estadísticas */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Jugadores ({formatNumber(jugadoresFiltrados.length)})
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestión de jugadores de dodgeball
            </p>
          </div>
          <Badge variant="primary" size="lg">
            {posicionesUnicas.length} posiciones
          </Badge>
        </div>
      </Card>

      {/* Controles de filtro */}
      <FilterControls
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === 'equipo') setFiltroEquipo(value);
          if (key === 'posicion') setFiltroPosicion(value);
          setPaginaActual(1);
        }}
        onClearFilters={() => {
          setFiltroEquipo('');
          setFiltroPosicion('');
          setPaginaActual(1);
        }}
      />

      {/* Grid de jugadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {jugadoresPagina.map((jugador) => (
          <JugadorCard
            key={jugador._id}
            jugador={jugador}
            onClick={() => setJugadorSeleccionado(jugador)}
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

      {/* Modal de jugador */}
      {jugadorSeleccionado && (
        <ModalJugador
          jugador={jugadorSeleccionado}
          onClose={() => setJugadorSeleccionado(null)}
        />
      )}
    </div>
  );
}

// ✅ VENTAJAS DE LA NUEVA ESTRUCTURA:
// 1. Imports más cortos y organizados
// 2. Componentes reutilizables y consistentes
// 3. Código más mantenible y escalable
// 4. Mejor separación de responsabilidades
// 5. Fácil de extender con nuevas funcionalidades
