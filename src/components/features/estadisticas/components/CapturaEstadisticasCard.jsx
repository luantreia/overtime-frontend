// src/components/features/estadisticas/components/CapturaEstadisticasCard.jsx
import React, { useState } from 'react';
import { Card, Badge, Button, Select } from '../../../ui';

/**
 * Componente mejorado para captura de estadísticas de partido
 */
const CapturaEstadisticasCard = ({
  partido,
  seleccionesLocal = [],
  seleccionesVisitante = [],
  estadisticas = {},
  jugadoresLocal = [],
  jugadoresVisitante = [],
  onJugadorChange,
  onEstadisticaChange,
  onGuardar,
  guardando = false,
  hayDatosAutomaticos = false,
  className = ''
}) => {
  const [setSeleccionado, setSetSeleccionado] = useState(0);

  const renderJugadorSlot = (equipo, posicion, equipoNombre, colorClass, bgClass) => {
    const jugadoresEquipo = equipo === 'local' ? jugadoresLocal : jugadoresVisitante;
    const seleccionesEquipo = equipo === 'local' ? seleccionesLocal : seleccionesVisitante;

    const jugadorSeleccionado = seleccionesEquipo[posicion];
    const jugador = jugadoresEquipo.find(jug =>
      (jug.jugadorPartidoId || jug._id) === jugadorSeleccionado
    );

    const stats = estadisticas[jugadorSeleccionado] || {};

    return (
      <Card key={`${equipo}-${posicion}`} className={`${bgClass} ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" size="sm">
              {equipoNombre} - Pos {posicion + 1}
            </Badge>
            {hayDatosAutomaticos && (
              <Badge variant="success" size="xs">
                Auto
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Selección de jugador */}
          <div>
            <Select
              value={jugadorSeleccionado || ''}
              onChange={(e) => onJugadorChange?.(equipo, posicion, e.target.value)}
              size="sm"
              className="w-full"
            >
              <option value="">Seleccionar jugador</option>
              {jugadoresEquipo.map(jug => (
                <option key={jug.jugadorPartidoId || jug._id} value={jug.jugadorPartidoId || jug._id}>
                  {jug.nombre || jug.jugador?.nombre || 'Jugador'}
                </option>
              ))}
            </Select>
          </div>

          {/* Estadísticas del jugador */}
          {jugadorSeleccionado && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Lanzamientos
                </label>
                <input
                  type="number"
                  min="0"
                  value={stats.throws || ''}
                  onChange={(e) => onEstadisticaChange?.(jugadorSeleccionado, 'throws', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Hits
                </label>
                <input
                  type="number"
                  min="0"
                  value={stats.hits || ''}
                  onChange={(e) => onEstadisticaChange?.(jugadorSeleccionado, 'hits', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Outs
                </label>
                <input
                  type="number"
                  min="0"
                  value={stats.outs || ''}
                  onChange={(e) => onEstadisticaChange?.(jugadorSeleccionado, 'outs', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Catches
                </label>
                <input
                  type="number"
                  min="0"
                  value={stats.catches || ''}
                  onChange={(e) => onEstadisticaChange?.(jugadorSeleccionado, 'catches', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <Card title="Captura de Estadísticas" className={className}>
      {/* Información del partido */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {partido?.equipoLocal?.nombre || 'Equipo Local'}
              </div>
              <Badge variant="primary" size="sm">Local</Badge>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                VS
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {partido?.equipoVisitante?.nombre || 'Equipo Visitante'}
              </div>
              <Badge variant="secondary" size="sm">Visitante</Badge>
            </div>
          </div>

          {hayDatosAutomaticos && (
            <div className="text-right">
              <Badge variant="success">
                Datos automáticos disponibles
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Controles de set */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSetSeleccionado(Math.max(0, setSeleccionado - 1))}
            disabled={setSeleccionado === 0}
          >
            ← Set Anterior
          </Button>
          <Badge variant="primary">
            Set {setSeleccionado + 1}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSetSeleccionado(setSeleccionado + 1)}
          >
            Siguiente Set →
          </Button>
        </div>

        <Button
          variant="success"
          onClick={onGuardar}
          loading={guardando}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar Estadísticas'}
        </Button>
      </div>

      {/* Grid de jugadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Equipo Local */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            {partido?.equipoLocal?.nombre || 'Equipo Local'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3, 4, 5].map(posicion =>
              renderJugadorSlot('local', posicion, 'Local', 'text-blue-600', 'bg-blue-50 dark:bg-blue-900/20')
            )}
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
            {partido?.equipoVisitante?.nombre || 'Equipo Visitante'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3, 4, 5].map(posicion =>
              renderJugadorSlot('visitante', posicion, 'Visitante', 'text-green-600', 'bg-green-50 dark:bg-green-900/20')
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CapturaEstadisticasCard;
