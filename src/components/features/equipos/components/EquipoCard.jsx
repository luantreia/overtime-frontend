// src/components/features/equipos/components/EquipoCard.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';

/**
 * Componente EquipoCard para mostrar información de equipo en tarjetas
 */
const EquipoCard = ({
  equipo,
  onClick,
  showStats = true,
  compact = false,
  className = ''
}) => {
  const { nombre, escudo, pais, esSeleccionNacional, estadisticas } = equipo;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={onClick}
      variant={esSeleccionNacional ? 'outlined' : 'default'}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {escudo ? (
            <img
              src={escudo}
              alt={`Escudo de ${nombre}`}
              className={`rounded-full object-cover ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}
            />
          ) : (
            <div className={`rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
              <span className={`font-bold text-gray-600 dark:text-gray-300 ${compact ? 'text-lg' : 'text-2xl'}`}>
                {nombre[0]}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {nombre}
            </h3>
            <Badge variant={esSeleccionNacional ? 'primary' : 'secondary'} size="xs">
              {esSeleccionNacional ? 'Selección' : 'Club'}
            </Badge>
          </div>

          {pais && (
            <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
              {pais}
            </p>
          )}

          {showStats && estadisticas && (
            <div className={`flex space-x-4 mt-2 ${compact ? 'text-xs' : 'text-sm'}`}>
              <span className="text-blue-600 dark:text-blue-400">
                {estadisticas.totalPartidos || 0} partidos
              </span>
              <span className="text-green-600 dark:text-green-400">
                {estadisticas.partidosGanados || 0} victorias
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EquipoCard;
