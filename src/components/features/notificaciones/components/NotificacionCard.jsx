// src/components/features/notificaciones/components/NotificacionCard.jsx
import React from 'react';
import { Card, Badge, Button } from '../../../ui';
import { formatDate } from '../../../utils';

/**
 * Componente NotificacionCard para mostrar notificaciones individuales
 */
const NotificacionCard = ({
  notificacion,
  onMarkAsRead,
  onDelete,
  compact = false,
  className = ''
}) => {
  const {
    titulo,
    mensaje,
    tipo,
    leida,
    fechaCreacion,
    accionUrl,
    prioridad = 'normal'
  } = notificacion;

  const tipoVariant = {
    info: 'primary',
    success: 'success',
    warning: 'warning',
    error: 'danger'
  }[tipo] || 'primary';

  const prioridadVariant = {
    baja: 'secondary',
    normal: 'primary',
    alta: 'warning',
    urgente: 'danger'
  }[prioridad] || 'primary';

  const handleClick = () => {
    if (accionUrl) {
      window.open(accionUrl, '_blank');
    }
    if (!leida) {
      onMarkAsRead?.(notificacion._id);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        !leida ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        {/* Icono de tipo */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            tipo === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
            tipo === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
            tipo === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
            'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
          }`}>
            {tipo === 'success' ? '✓' :
             tipo === 'warning' ? '⚠' :
             tipo === 'error' ? '✕' : 'ℹ'}
          </div>
        </div>

        {/* Contenido de la notificación */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {titulo}
            </h3>
            <Badge variant={prioridadVariant} size="xs">
              {prioridad}
            </Badge>
            {!leida && (
              <Badge variant="primary" size="xs">
                Nueva
              </Badge>
            )}
          </div>

          <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-sm' : 'text-base'} mb-3`}>
            {mensaje}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(fechaCreacion)}
            </span>

            {/* Acciones */}
            <div className="flex items-center space-x-2">
              {!leida && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead?.(notificacion._id);
                  }}
                >
                  Marcar leída
                </Button>
              )}
              <Button
                variant="danger"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(notificacion._id);
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificacionCard;
