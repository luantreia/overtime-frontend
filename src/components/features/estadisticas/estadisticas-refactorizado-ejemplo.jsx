// Ejemplo de página de Estadísticas refactorizada con nueva estructura

// ✅ IMPORTACIONES NUEVAS Y LIMPIAS:
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, Spinner } from '../ui';
import { ModalEstadisticas, EstadisticasGeneralesCard } from '../features/estadisticas';
import { usePartidos } from '../hooks/partidos/usePartidos';
import { useAuth } from '../context/AuthContext';
import { ITEMS_PER_PAGE, PARTIDO_ESTADOS } from '../utils/constants';
import { formatDate, formatNumber } from '../utils/formatters';

// ✅ COMPONENTE MEJORADO:
export default function EstadisticasRefactorizado() {
  const { token } = useAuth();
  const { partidos, loading, error } = usePartidos(token);

  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState(PARTIDO_ESTADOS.TODOS);
  const [paginaActual, setPaginaActual] = useState(1);

  const partidosFiltrados = useMemo(() => {
    if (filtroEstado === PARTIDO_ESTADOS.TODOS) return partidos;

    return partidos.filter(partido => partido.estado === filtroEstado);
  }, [partidos, filtroEstado]);

  const totalPaginas = Math.ceil(partidosFiltrados.length / ITEMS_PER_PAGE);
  const partidosPagina = partidosFiltrados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Estadísticas rápidas
  const estadisticasGenerales = useMemo(() => {
    const total = partidos.length;
    const finalizados = partidos.filter(p => p.estado === PARTIDO_ESTADOS.FINALIZADO).length;
    const enVivo = partidos.filter(p => p.estado === PARTIDO_ESTADOS.EN_VIVO).length;

    return { total, finalizados, enVivo };
  }, [partidos]);

  if (loading) {
    return <Spinner size="lg" message="Cargando partidos..." />;
  }

  if (error) {
    return (
      <Card variant="danger">
        <p>Error al cargar partidos: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas rápidas */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Estadísticas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Captura y análisis de estadísticas de partidos
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="primary">
              {formatNumber(estadisticasGenerales.total)} partidos
            </Badge>
            <Badge variant="success">
              {formatNumber(estadisticasGenerales.finalizados)} finalizados
            </Badge>
          </div>
        </div>
      </Card>

      {/* Grid de partidos para gestión de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partidosPagina.map((partido) => (
          <Card
            key={partido._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setPartidoSeleccionado(partido)}
          >
            <div className="flex items-center justify-between mb-3">
              <Badge
                variant={
                  partido.estado === PARTIDO_ESTADOS.EN_VIVO ? 'success' :
                  partido.estado === PARTIDO_ESTADOS.FINALIZADO ? 'primary' :
                  partido.estado === PARTIDO_ESTADOS.CANCELADO ? 'danger' : 'secondary'
                }
              >
                {partido.estado === PARTIDO_ESTADOS.EN_VIVO ? 'En vivo' :
                 partido.estado === PARTIDO_ESTADOS.FINALIZADO ? 'Finalizado' :
                 partido.estado === PARTIDO_ESTADOS.CANCELADO ? 'Cancelado' : 'Programado'}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(partido.fecha)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {partido.equipoLocal?.nombre || 'Equipo Local'}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {partido.marcadorLocal || 0}
                </span>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                  VS
                </span>
                <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {partido.equipoVisitante?.nombre || 'Equipo Visitante'}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {partido.marcadorVisitante || 0}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setPartidoSeleccionado(partido);
                }}
              >
                📊 Gestionar Estadísticas
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Paginación */}
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

      {/* Modal de estadísticas */}
      {partidoSeleccionado && (
        <ModalEstadisticas
          partido={partidoSeleccionado}
          onClose={() => setPartidoSeleccionado(null)}
          onEstadisticasGuardadas={() => {
            setPartidoSeleccionado(null);
            // Recargar datos si es necesario
          }}
        />
      )}
    </div>
  );
}

// ✅ VENTAJAS DE LA NUEVA ESTRUCTURA:
// 1. Organización clara por dominio (estadísticas)
// 2. Componentes reutilizables y modulares
// 3. Mejor separación de responsabilidades
// 4. Fácil mantenimiento y extensión
// 5. Integración con el sistema de constantes y utilidades
