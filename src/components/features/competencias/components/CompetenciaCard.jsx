// src/components/features/competencias/components/CompetenciaCard.jsx
import React from 'react';
import { Card, Badge, Button } from '../../../ui';
import { formatDate } from '../../../../utils';

/**
 * Componente CompetenciaCard para mostrar información de competencia en tarjetas
 */
const CompetenciaCard = ({
  competencia,
  onClick,
  showStats = true,
  compact = false,
  className = '',
  isAdmin = false,
  onAdminClick
}) => {
  const {
    nombre,
    descripcion,
    fechaInicio,
    fechaFin,
    estado,
    tipo,
    temporadas = []
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
        <div className="flex items-center gap-2">
          <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 text-right`}>
            <div>{fechaInicioFormateada}</div>
            {fechaFin && <div>hasta {fechaFinFormateada}</div>}
          </div>
          {isAdmin && (
            <Button
              variant="danger"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onAdminClick && onAdminClick();
              }}
              title="Administrar competencia"
            >
              ⚙️ Admin
            </Button>
          )}
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
        {showStats && (temporadas.length > 0) && (
          <div className={`${compact ? 'text-xs' : 'text-sm'}`}>
            <span className="text-amber-600 dark:text-amber-400">
              {temporadas.length} temporadas
            </span>
          </div>
        )}

        {/* Información de fases (si aplica) */}
        {competencia.temporadas && competencia.temporadas.length > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Temporadas: {competencia.temporadas.length}
            </p>
            <div className="flex flex-wrap gap-1">
              {competencia.temporadas.slice(0, 3).map((temp, index) => (
                <Badge key={index} variant="outline" size="xs">
                  {temp.nombre || temp.anio || `Temporada ${index + 1}`}
                </Badge>
              ))}
              {competencia.temporadas.length > 3 && (
                <Badge variant="outline" size="xs">
                  +{competencia.temporadas.length - 3} más
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
