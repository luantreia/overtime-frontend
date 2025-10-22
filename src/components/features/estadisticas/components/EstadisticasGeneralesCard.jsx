// src/components/features/estadisticas/components/EstadisticasGeneralesCard.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';
import { formatPercentage, formatNumber } from '../../../../utils/formatters';

/**
 * Componente para mostrar estadísticas generales de partido
 */
const EstadisticasGeneralesCard = ({
  partido,
  estadisticas,
  title = 'Estadísticas Generales',
  className = ''
}) => {
  if (!estadisticas) {
    return (
      <Card title={title} className={className}>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay estadísticas disponibles
        </p>
      </Card>
    );
  }

  const {
    totalThrows = 0,
    totalHits = 0,
    totalOuts = 0,
    totalCatches = 0,
    efectividadHits = 0,
    promedioHitsPorSet = 0,
    promedioOutsPorSet = 0,
    promedioCatchesPorSet = 0
  } = estadisticas;

  return (
    <Card title={title} className={className}>
      <div className="space-y-6">
        {/* Información del partido */}
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {partido?.fecha ? new Date(partido.fecha).toLocaleDateString() : 'Fecha no disponible'}
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {partido?.equipoLocal?.nombre || 'Equipo Local'} vs {partido?.equipoVisitante?.nombre || 'Equipo Visitante'}
          </div>
          {partido?.marcadorLocal !== undefined && partido?.marcadorVisitante !== undefined && (
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {partido.marcadorLocal} - {partido.marcadorVisitante}
            </div>
          )}
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(totalThrows)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Lanzamientos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(totalHits)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hits</div>
          </div>
        </div>

        {/* Efectividad */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Efectividad de hits
            </span>
            <Badge variant={efectividadHits >= 70 ? 'success' : efectividadHits >= 50 ? 'warning' : 'danger'}>
              {formatPercentage(efectividadHits / 100)}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${efectividadHits}%` }}
            ></div>
          </div>
        </div>

        {/* Promedios por set */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              {promedioHitsPorSet.toFixed(1)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Hits por set</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-lg font-semibold text-red-700 dark:text-red-300">
              {promedioOutsPorSet.toFixed(1)}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">Outs por set</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              {promedioCatchesPorSet.toFixed(1)}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Catches por set</div>
          </div>
        </div>

        {/* Estadísticas detalladas */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Estadísticas detalladas
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total lanzamientos:</span>
                <span className="font-medium">{formatNumber(totalThrows)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Hits logrados:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{formatNumber(totalHits)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Outs recibidos:</span>
                <span className="font-medium text-red-600 dark:text-red-400">{formatNumber(totalOuts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Catches realizados:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{formatNumber(totalCatches)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EstadisticasGeneralesCard;
