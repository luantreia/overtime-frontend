// src/components/features/usuarios/components/UsuarioCard.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';
import { formatDate } from '../../../../utils/formatters';

/**
 * Componente UsuarioCard para mostrar información de usuario en tarjetas
 */
const UsuarioCard = ({
  usuario,
  onClick,
  onEdit,
  onDelete,
  showActions = true,
  compact = false,
  className = ''
}) => {
  const {
    nombre,
    apellido,
    email,
    rol = [],
    fechaRegistro,
    ultimoAcceso,
    activo = true,
    estadisticas = {}
  } = usuario;

  const nombreCompleto = `${nombre || ''} ${apellido || ''}`.trim() || 'Usuario sin nombre';

  const rolesArray = Array.isArray(rol) ? rol : [rol].filter(Boolean);
  const rolesOrdenados = rolesArray.sort((a, b) => {
    const prioridad = { admin: 3, moderador: 2, usuario: 1 };
    return (prioridad[b] || 0) - (prioridad[a] || 0);
  });

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`} onClick={onClick}>
      <div className="flex items-start space-x-4">
        {/* Avatar del usuario */}
        <div className="flex-shrink-0">
          <div className={`rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
            <span className={`font-bold text-gray-600 dark:text-gray-300 ${compact ? 'text-lg' : 'text-2xl'}`}>
              {nombreCompleto[0]}
            </span>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {nombreCompleto}
            </h3>
            <Badge variant={activo ? 'success' : 'danger'} size="xs">
              {activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          <p className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'} mb-2`}>
            {email}
          </p>

          {/* Roles del usuario */}
          <div className="flex flex-wrap gap-1 mb-3">
            {rolesOrdenados.map((role, index) => (
              <Badge
                key={index}
                variant={
                  role === 'admin' ? 'danger' :
                  role === 'moderador' ? 'warning' : 'secondary'
                }
                size="xs"
              >
                {role === 'admin' ? '👑 Admin' :
                 role === 'moderador' ? '⚖️ Moderador' : '👤 Usuario'}
              </Badge>
            ))}
          </div>

          {/* Información adicional */}
          <div className={`grid grid-cols-2 gap-4 ${compact ? 'text-xs' : 'text-sm'}`}>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Registrado:</span>
              <p className="font-medium">
                {formatDate(fechaRegistro)}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Último acceso:</span>
              <p className="font-medium">
                {ultimoAcceso ? formatDate(ultimoAcceso) : 'Nunca'}
              </p>
            </div>
          </div>

          {/* Estadísticas básicas */}
          {estadisticas && Object.keys(estadisticas).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {estadisticas.partidosJugados || 0}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Partidos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {estadisticas.equiposCreados || 0}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Equipos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600 dark:text-purple-400">
                    {estadisticas.competencias || 0}
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
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UsuarioCard;
