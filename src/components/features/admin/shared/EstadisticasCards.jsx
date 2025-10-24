// src/components/features/admin/components/EstadisticasCards.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';
import { formatNumber, formatPercentage } from '../../../utils';

/**
 * Componente EstadisticasCards mejorado usando componentes UI reutilizables
 */
export function EstadisticasCards({ estadisticas }) {
  // Calcular totales del partido desde estadísticas agregadas de equipos
  const equiposData = estadisticas.equipos || [];
  const totales = equiposData.reduce((acc, equipo) => ({
    throws: acc.throws + (equipo.throws || 0),
    hits: acc.hits + (equipo.hits || 0),
    outs: acc.outs + (equipo.outs || 0),
    catches: acc.catches + (equipo.catches || 0),
  }), { throws: 0, hits: 0, outs: 0, catches: 0 });

  const efectividadGeneral = totales.throws > 0
    ? ((totales.hits / totales.throws) * 100).toFixed(1)
    : 0;

  const jugadoresTotales = estadisticas.jugadores?.length || 0;

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Lanzamientos
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(totales.throws)}
          </div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Hits
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatNumber(totales.hits)}
          </div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Outs
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatNumber(totales.outs)}
          </div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Catches
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatNumber(totales.catches)}
          </div>
        </Card>

        {/* Estadísticas adicionales */}
        <Card className="text-center p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Efectividad
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {efectividadGeneral}%
          </div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Equipos
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatNumber(equiposData.length)}
          </div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Jugadores
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatNumber(jugadoresTotales)}
          </div>
        </Card>

        <Card className="text-center p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Promedio Hits/Set
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {totales.throws > 0 ? (totales.hits / Math.ceil(totales.throws / 6)).toFixed(1) : '0.0'}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default EstadisticasCards;
