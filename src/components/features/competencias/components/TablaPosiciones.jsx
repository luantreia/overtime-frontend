// src/components/features/competencias/components/TablaPosiciones.jsx
import React from 'react';
import { Card, Badge, Table } from '../../../ui';
import { formatNumber } from '../../../../utils';

/**
 * Componente TablaPosiciones para mostrar tabla de posiciones de competencia
 */
const TablaPosiciones = ({
  posiciones = [],
  title = 'Tabla de Posiciones',
  className = ''
}) => {
  if (!posiciones || posiciones.length === 0) {
    return (
      <Card title={title} className={className}>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay posiciones disponibles
        </p>
      </Card>
    );
  }

  const headers = ['Pos', 'Equipo', 'PJ', 'PG', 'PE', 'PP', 'Pts', 'Dif'];

  return (
    <Card title={title} className={className}>
      <Table
        headers={headers}
        data={posiciones.map((pos, index) => ({
          pos: (
            <div className="flex items-center space-x-2">
              <span className={`font-bold ${pos.posicion <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                #{pos.posicion}
              </span>
              {pos.posicion <= 3 && (
                <Badge variant="warning" size="xs">
                  {pos.posicion === 1 ? '🥇' : pos.posicion === 2 ? '🥈' : '🥉'}
                </Badge>
              )}
            </div>
          ),
          equipo: (
            <div className="flex items-center space-x-3">
              {pos.equipo?.escudo && (
                <img
                  src={pos.equipo.escudo}
                  alt={pos.equipo.nombre}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {pos.equipo?.nombre || 'Equipo desconocido'}
              </span>
            </div>
          ),
          pj: formatNumber(pos.partidosJugados || 0),
          pg: formatNumber(pos.partidosGanados || 0),
          pe: formatNumber(pos.partidosEmpatados || 0),
          pp: formatNumber(pos.partidosPerdidos || 0),
          pts: formatNumber(pos.puntos || 0),
          dif: (
            <span className={`${(pos.golesFavor || 0) - (pos.golesContra || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {((pos.golesFavor || 0) - (pos.golesContra || 0) >= 0 ? '+' : '') + formatNumber((pos.golesFavor || 0) - (pos.golesContra || 0))}
            </span>
          )
        }))}
        striped={true}
        hover={true}
      />
    </Card>
  );
};

export default TablaPosiciones;
