// src/components/features/competencias/components/CompetenciaCard.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';
import { formatDate } from '../../../utils';

/**
 * Componente CompetenciaCard para mostrar información de competencia en tarjetas
 */
const CompetenciaCard = ({
  competencia,
  onClick,
  showStats = true,
  compact = false,
  className = ''
}) => {
  const {
    nombre,
    descripcion,
    fechaInicio,
    fechaFin,
    estado,
    tipo,
    equipos = [],
    partidos = []
  } = competencia;

  const estadoVariant = {
    activa: 'success',
    finalizada: 'primary',
    cancelada: 'danger',
    programada: 'secondary'
  }[estado] || 'secondary';

  const fechaInicioFormateada = formatDate(fechaInicio);
  const fechaFinFormateada = formatDate(fechaFin);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      {/* Header con estado y fechas */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant={estadoVariant} size="sm">
          {estado === 'activa' ? 'Activa' :
           estado === 'finalizada' ? 'Finalizada' :
           estado === 'cancelada' ? 'Cancelada' : 'Programada'}
        </Badge>
        <div className={`text-right ${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
          <div>{fechaInicioFormateada}</div>
          {fechaFin && <div>hasta {fechaFinFormateada}</div>}
        </div>
      </div>

      {/* Información principal */}
      <div className="space-y-3">
        <div>
          <h3 className={`font-bold text-gray-900 dark:text-white ${compact ? 'text-base' : 'text-lg'}`}>
            {nombre}
          </h3>
          {descripcion && (
            <p className={`text-gray-600 dark:text-gray-400 mt-1 ${compact ? 'text-sm' : 'text-base'}`}>
              {descripcion}
            </p>
          )}
        </div>

        {/* Tipo de competencia */}
        {tipo && (
          <Badge variant="outline" size="sm">
            {tipo}
          </Badge>
        )}

        {/* Estadísticas */}
        {showStats && (equipos.length > 0 || partidos.length > 0) && (
          <div className={`flex space-x-4 ${compact ? 'text-xs' : 'text-sm'}`}>
            {equipos.length > 0 && (
              <span className="text-blue-600 dark:text-blue-400">
                {equipos.length} equipos
              </span>
            )}
            {partidos.length > 0 && (
              <span className="text-green-600 dark:text-green-400">
                {partidos.length} partidos
              </span>
            )}
          </div>
        )}

        {/* Información de fases (si aplica) */}
        {competencia.fases && competencia.fases.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Fases: {competencia.fases.length}
            </p>
            <div className="flex flex-wrap gap-1">
              {competencia.fases.slice(0, 3).map((fase, index) => (
                <Badge key={index} variant="outline" size="xs">
                  {fase.nombre || `Fase ${index + 1}`}
                </Badge>
              ))}
              {competencia.fases.length > 3 && (
                <Badge variant="outline" size="xs">
                  +{competencia.fases.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CompetenciaCard;
