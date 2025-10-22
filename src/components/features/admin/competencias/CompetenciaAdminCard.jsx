// src/components/features/admin/competencias/CompetenciaAdminCard.jsx
import React from 'react';
import { Card, Badge, Button } from '../../../ui';
import { formatDate } from '../../../../utils/formatters';

/**
 * Componente CompetenciaAdminCard para mostrar información de competencia en administración
 */
const CompetenciaAdminCard = ({
  competencia,
  onEdit,
  onDelete,
  onView,
  showActions = true,
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
    fases = [],
    temporadas = []
  } = competencia;

  const estadoVariant = {
    activa: 'success',
    finalizada: 'primary',
    cancelada: 'danger',
    programada: 'secondary'
  }[estado] || 'secondary';

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="space-y-4">
        {/* Header con título y estado */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {nombre}
          </h3>
          <Badge variant={estadoVariant}>
            {estado === 'activa' ? 'Activa' :
             estado === 'finalizada' ? 'Finalizada' :
             estado === 'cancelada' ? 'Cancelada' : 'Programada'}
          </Badge>
        </div>

        {/* Descripción */}
        {descripcion && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {descripcion}
          </p>
        )}

        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Inicio:</span>
            <p className="font-medium">
              {formatDate(fechaInicio)}
            </p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Fin:</span>
            <p className="font-medium">
              {fechaFin ? formatDate(fechaFin) : 'No definida'}
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              {equipos.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Equipos</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-lg font-semibold text-green-700 dark:text-green-300">
              {fases.length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">Fases</div>
          </div>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
              {temporadas.length}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">Temporadas</div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {tipo && (
                <Badge variant="outline" size="xs">
                  {tipo}
                </Badge>
              )}
              <span className="text-gray-600 dark:text-gray-400">
                Creada: {formatDate(competencia.fechaCreacion)}
              </span>
            </div>

            {/* Acciones */}
            {showActions && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={onView}>
                  Ver Detalles
                </Button>
                <Button variant="secondary" size="sm" onClick={onEdit}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={onDelete}>
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CompetenciaAdminCard;
