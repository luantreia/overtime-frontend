// src/components/features/partidos/components/PartidoCard.jsx
import React from 'react';
import { Card, Badge, Button } from '../../../ui';
import { formatDate } from '../../../../utils/formatters';
import { normalizeEquipoNombre } from '../../../../utils/partidoUtils';

/**
 * Componente PartidoCard para mostrar información de partido en tarjetas
 */
const PartidoCard = ({
  partido,
  onClick,
  showScore = true,
  compact = false,
  className = '',
  isAdmin = false,
  onAdminClick
}) => {
  const {
    equipoLocal,
    equipoVisitante,
    marcadorLocal,
    marcadorVisitante,
    fecha,
    estado,
    competencia,
    fase,
    equipoLocalNombre,
    equipoVisitanteNombre
  } = partido;

  const fechaFormateada = formatDate(fecha);
  const estadoVariant = {
    programado: 'secondary',
    en_vivo: 'success',
    finalizado: 'primary',
    cancelado: 'danger'
  }[estado] || 'secondary';

  const ligaBadgeLabel = competencia?.nombre || 'Amistoso';
  const categoriaLabel = partido?.categoria;
  const modalidadLabel = partido?.modalidad;

  const nombreLocal = normalizeEquipoNombre(equipoLocal, equipoLocalNombre, 'Equipo local');
  const nombreVisitante = normalizeEquipoNombre(equipoVisitante, equipoVisitanteNombre, 'Equipo visitante');

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      {/* Header con estado y fecha */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={estadoVariant} size="sm">
            {estado === 'en_vivo' ? 'En vivo' :
             estado === 'finalizado' ? 'Finalizado' :
             estado === 'cancelado' ? 'Cancelado' : 'Programado'}
          </Badge>
          <Badge variant="outline" size="sm">
            {ligaBadgeLabel}
          </Badge>
          {categoriaLabel && (
            <Badge variant="outline" size="sm">
              {categoriaLabel}
            </Badge>
          )}
          {modalidadLabel && (
            <Badge variant="outline" size="sm">
              {modalidadLabel}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
            {fechaFormateada}
          </span>
          {isAdmin && (
            <Button
              variant="danger"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onAdminClick && onAdminClick();
              }}
              title="Administrar partido"
            >
              ⚙️ Admin
            </Button>
          )}
        </div>
      </div>

      {/* Equipos y marcador */}
      <div className="space-y-3">
        {/* Equipo local */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {equipoLocal?.escudo && (
              <img
                src={equipoLocal.escudo}
                alt={nombreLocal}
                loading="lazy"
                decoding="async"
                className={`rounded-full object-cover ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
              />
            )}
            <span className={`font-medium text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {nombreLocal}
            </span>
          </div>
          {showScore && (
            <span className={`font-bold ${compact ? 'text-lg' : 'text-xl'} text-gray-900 dark:text-white`}>
              {marcadorLocal || 0}
            </span>
          )}
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
          <span className="px-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
            VS
          </span>
          <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        {/* Equipo visitante */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {equipoVisitante?.escudo && (
              <img
                src={equipoVisitante.escudo}
                alt={nombreVisitante}
                loading="lazy"
                decoding="async"
                className={`rounded-full object-cover ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
              />
            )}
            <span className={`font-medium text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {nombreVisitante}
            </span>
          </div>
          {showScore && (
            <span className={`font-bold ${compact ? 'text-lg' : 'text-xl'} text-gray-900 dark:text-white`}>
              {marcadorVisitante || 0}
            </span>
          )}
        </div>
      </div>

      {/* Información adicional */}
      {(competencia?.nombre || fase?.nombre) && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {competencia?.nombre && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {competencia.nombre}
            </p>
          )}
          {fase?.nombre && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {fase.nombre}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default React.memo(PartidoCard);
