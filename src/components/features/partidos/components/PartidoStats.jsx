// src/components/features/partidos/components/PartidoStats.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';
import { formatPercentage } from '../../../../utils/formatters';
import { formatDate } from '../../../../utils/formatters'; 
import { formatNumber } from '../../../../utils/formatters';

/**
 * Componente PartidoStats para mostrar estadísticas de partido
 */
const PartidoStats = ({
  partido,
  stats,
  title = 'Estadísticas del Partido',
  className = ''
}) => {
  if (!partido && !stats) {
    return (
      <Card title={title} className={className}>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay datos disponibles
        </p>
      </Card>
    );
  }

  const {
    totalSets = 0,
    setsLocal = 0,
    setsVisitante = 0,
    duracion = 0,
    espectadores = 0
  } = stats || {};

  const resultado = setsLocal > setsVisitante ? 'local' :
                   setsVisitante > setsLocal ? 'visitante' : 'empate';

  return (
    <Card title={title} className={className}>
      <div className="space-y-4">
        {/* Resultado del partido */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {setsLocal} - {setsVisitante}
          </div>
          <Badge
            variant={
              resultado === 'local' ? 'success' :
              resultado === 'visitante' ? 'danger' : 'secondary'
            }
            size="lg"
          >
            {resultado === 'local' ? 'Victoria Local' :
             resultado === 'visitante' ? 'Victoria Visitante' : 'Empate'}
          </Badge>
        </div>

        {/* Estadísticas básicas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(totalSets)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sets jugados</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(duracion)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Minutos</div>
          </div>
        </div>

        {/* Información del partido */}
        {partido && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                <span className="font-medium">
                  {new Date(partido.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {partido.competencia?.nombre && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Competencia:</span>
                  <span className="font-medium">{partido.competencia.nombre}</span>
                </div>
              )}

              {espectadores > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Espectadores:</span>
                  <span className="font-medium">{formatNumber(espectadores)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estado del partido */}
        {partido?.estado && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center">
              <Badge
                variant={
                  partido.estado === 'en_vivo' ? 'success' :
                  partido.estado === 'finalizado' ? 'primary' :
                  partido.estado === 'cancelado' ? 'danger' : 'secondary'
                }
              >
                {partido.estado === 'en_vivo' ? 'En vivo' :
                 partido.estado === 'finalizado' ? 'Finalizado' :
                 partido.estado === 'cancelado' ? 'Cancelado' : 'Programado'}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PartidoStats;
