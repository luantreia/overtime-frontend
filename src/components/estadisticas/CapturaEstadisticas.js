// src/components/estadisticas/CapturaEstadisticas.js
import React, { useState } from 'react';
import { CheckCircleIcon, UserGroupIcon, ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CacheInfo } from './index';

/**
 * Componente para capturar estadísticas del partido
 */
const CapturaEstadisticas = ({
  partido,
  seleccionesLocal,
  seleccionesVisitante,
  estadisticas,
  getJugadoresPorEquipo,
  cambiarSeleccionJugador,
  cambiarEstadistica,
  setMostrarAsignacion,
  guardar,
  guardando,
  hayDatosAutomaticos
}) => {
  const [setSeleccionado, setSetSeleccionado] = useState(0);

  // Obtener jugadores disponibles por equipo
  const jugadoresLocal = getJugadoresPorEquipo(partido?.equipoLocal?._id);
  const jugadoresVisitante = getJugadoresPorEquipo(partido?.equipoVisitante?._id);

  const renderJugadorSlot = (equipo, posicion, equipoId, equipoNombre, colorClass, bgClass) => {
    const jugadorSeleccionado = equipo === 'local' ? seleccionesLocal[posicion] : seleccionesVisitante[posicion];
    const jugador = jugadorSeleccionado ?
      (equipo === 'local' ? jugadoresLocal : jugadoresVisitante)
        .find(jug => (jug.jugadorPartidoId || jug._id) === jugadorSeleccionado) : null;

    const stats = estadisticas[jugadorSeleccionado] || {};

    return (
      <div key={`${equipo}-${posicion}`} className={`${bgClass} border rounded-lg p-2 sm:p-3 dark:border-gray-600`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs sm:text-sm font-medium ${colorClass}`}>
            {equipoNombre} - Posición {posicion + 1}
          </span>
          <select
            value={jugadorSeleccionado || ''}
            onChange={(e) => cambiarSeleccionJugador(equipo, posicion, e.target.value)}
            className="text-xs border rounded px-1 sm:px-2 py-1 w-24 sm:w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seleccionar</option>
            {(equipo === 'local' ? jugadoresLocal : jugadoresVisitante).map(jug => (
              <option key={jug.jugadorPartidoId || jug._id} value={jug.jugadorPartidoId || jug._id}>
                {jug.nombre || jug.jugador?.nombre || 'Jugador'}
              </option>
            ))}
          </select>
        </div>

        {jugador && (
          <div className="space-y-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {jugador.nombre || 'Jugador'}
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-xs">Throws</label>
                <input
                  type="number"
                  min="0"
                  value={stats.throws || 0}
                  onChange={(e) => cambiarEstadistica(jugadorSeleccionado, 'throws', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-1 py-0.5 text-center text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-xs">Hits</label>
                <input
                  type="number"
                  min="0"
                  value={stats.hits || 0}
                  onChange={(e) => cambiarEstadistica(jugadorSeleccionado, 'hits', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-1 py-0.5 text-center text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-xs">Outs</label>
                <input
                  type="number"
                  min="0"
                  value={stats.outs || 0}
                  onChange={(e) => cambiarEstadistica(jugadorSeleccionado, 'outs', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-1 py-0.5 text-center text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-gray-500 dark:text-gray-400 text-xs">Catches</label>
                <input
                  type="number"
                  min="0"
                  value={stats.catches || 0}
                  onChange={(e) => cambiarEstadistica(jugadorSeleccionado, 'catches', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-1 py-0.5 text-center text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMostrarAsignacion(true)}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Modificar Jugadores
          </button>
          <div className="text-sm text-gray-600">
            {seleccionesLocal.filter(Boolean).length + seleccionesVisitante.filter(Boolean).length} jugadores seleccionados
          </div>
        </div>

        <button
          onClick={guardar}
          disabled={guardando}
          className="flex items-center px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {guardando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Guardar Estadísticas
            </>
          )}
        </button>
      </div>

      {hayDatosAutomaticos && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            ⚠️ Se detectaron estadísticas automáticas. Revisa y ajusta los valores antes de guardar.
          </p>
        </div>
      )}

      <CacheInfo className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Equipo Local */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-400 flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded mr-2"></div>
            {partido?.equipoLocal?.nombre || 'Equipo Local'}
          </h3>
          <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
            {Array.from({ length: 10 }, (_, i) =>
              renderJugadorSlot('local', i, partido?.equipoLocal?._id, 'Local', 'text-blue-800 dark:text-blue-300', 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700')
            )}
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-400 flex items-center">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-600 rounded mr-2"></div>
            {partido?.equipoVisitante?.nombre || 'Equipo Visitante'}
          </h3>
          <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
            {Array.from({ length: 10 }, (_, i) =>
              renderJugadorSlot('visitante', i, partido?.equipoVisitante?._id, 'Visitante', 'text-red-800 dark:text-red-300', 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700')
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapturaEstadisticas;
