// src/components/features/jugadores/components/JugadorStats.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';
import { formatPercentage, formatNumber } from '../../../../utils/formatters';

/**
 * Componente JugadorStats para mostrar estadísticas de jugador
 */
const JugadorStats = ({
  stats,
  title = 'Estadísticas',
  showPercentages = true,
  className = ''
}) => {
  if (!stats) {
    return (
      <Card title={title} className={className}>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay estadísticas disponibles
        </p>
      </Card>
    );
  }

  const {
    totalPartidos = 0,
    partidosGanados = 0,
    partidosPerdidos = 0,
    partidosEmpatados = 0,
    totalThrows = 0,
    totalHits = 0,
    totalOuts = 0,
    totalCatches = 0,
    promedioHits = 0,
    promedioOuts = 0,
    promedioCatches = 0
  } = stats;

  const ratioVictorias = totalPartidos > 0 ? (partidosGanados / totalPartidos) * 100 : 0;
  const efectividadHits = totalThrows > 0 ? (totalHits / totalThrows) * 100 : 0;

  return (
    <Card title={title} className={className}>
      <div className="space-y-4">
        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(totalPartidos)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Partidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(partidosGanados)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Victorias</div>
          </div>
        </div>

        {/* Efectividad */}
        {showPercentages && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ratio de victorias
              </span>
              <Badge variant={ratioVictorias >= 50 ? 'success' : ratioVictorias >= 30 ? 'warning' : 'danger'}>
                {formatPercentage(ratioVictorias / 100)}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${ratioVictorias}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Estadísticas detalladas */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Lanzamientos:</span>
              <span className="font-medium">{formatNumber(totalThrows)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Hits:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{formatNumber(totalHits)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Outs:</span>
              <span className="font-medium text-red-600 dark:text-red-400">{formatNumber(totalOuts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Catches:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{formatNumber(totalCatches)}</span>
            </div>
          </div>
        </div>

        {/* Promedios */}
        {(promedioHits > 0 || promedioOuts > 0 || promedioCatches > 0) && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Promedios por partido</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                <div className="font-semibold text-green-700 dark:text-green-300">
                  {promedioHits.toFixed(1)}
                </div>
                <div className="text-green-600 dark:text-green-400">Hits</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
                <div className="font-semibold text-red-700 dark:text-red-300">
                  {promedioOuts.toFixed(1)}
                </div>
                <div className="text-red-600 dark:text-red-400">Outs</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  {promedioCatches.toFixed(1)}
                </div>
                <div className="text-blue-600 dark:text-blue-400">Catches</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default JugadorStats;
