// src/components/features/equipos/components/EquipoStats.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';
import { formatPercentage, formatNumber } from '../../../../utils/formatters';

/**
 * Componente EquipoStats para mostrar estadísticas de equipo
 */
const EquipoStats = ({
  stats,
  title = 'Estadísticas',
  showPercentage = true,
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
    ratioVictoria = 0
  } = stats;

  const percentage = totalPartidos > 0 ? (partidosGanados / totalPartidos) * 100 : 0;

  return (
    <Card title={title} className={className}>
      <div className="space-y-4">
        {/* Resumen general */}
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

        {/* Detalle de resultados */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
            <div className="text-lg font-semibold text-green-700 dark:text-green-300">
              {formatNumber(partidosGanados)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Ganados</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {formatNumber(partidosEmpatados)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Empates</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
            <div className="text-lg font-semibold text-red-700 dark:text-red-300">
              {formatNumber(partidosPerdidos)}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">Perdidos</div>
          </div>
        </div>

        {/* Porcentaje de victorias */}
        {showPercentage && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ratio de victorias
              </span>
              <Badge variant={percentage >= 50 ? 'success' : percentage >= 30 ? 'warning' : 'danger'}>
                {formatPercentage(percentage / 100)}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EquipoStats;
