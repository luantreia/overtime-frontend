// src/components/features/admin/components/EquipoAdminCard.jsx
import React from 'react';
import { Card, Badge, Button } from '../../../ui';
import { formatDate, formatNumber } from '../../../../utils';

/**
 * Componente EquipoAdminCard para mostrar información de equipo en administración
 */
const EquipoAdminCard = ({
  equipo,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  className = ''
}) => {
  const {
    nombre,
    escudo,
    pais,
    esSeleccionNacional,
    fechaCreacion,
    estadisticas,
    jugadores = []
  } = equipo;

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Escudo del equipo */}
        <div className="flex-shrink-0">
          {escudo ? (
            <img
              src={escudo}
              alt={`Escudo de ${nombre}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {nombre[0]}
              </span>
            </div>
          )}
        </div>

        {/* Información del equipo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {nombre}
            </h3>
            <Badge variant={esSeleccionNacional ? 'primary' : 'secondary'}>
              {esSeleccionNacional ? 'Selección' : 'Club'}
            </Badge>
          </div>

          {pais && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              🇯🇵 {pais}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Creado:</span>
              <p className="font-medium">
                {formatDate(fechaCreacion)}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Jugadores:</span>
              <p className="font-medium">{jugadores.length}</p>
            </div>
          </div>

          {estadisticas && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {estadisticas.totalPartidos || 0}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Partidos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {estadisticas.partidosGanados || 0}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Victorias</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600 dark:text-purple-400">
                    {estadisticas.totalCompetencias || 0}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Comp.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="flex-shrink-0 flex flex-col space-y-2">
            <Button variant="outline" size="sm" onClick={onView}>
              Ver
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
    </Card>
  );
};

export default EquipoAdminCard;
