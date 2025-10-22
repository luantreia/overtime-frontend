// src/components/features/usuarios/components/PerfilUsuario.jsx
import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '../../../ui';
import { formatDate } from '../../../../utils/formatters';

/**
 * Componente PerfilUsuario para mostrar y editar información de usuario
 */
const PerfilUsuario = ({
  usuario,
  onSave,
  onCancel,
  editable = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    email: usuario?.email || '',
    telefono: usuario?.telefono || '',
    fechaNacimiento: usuario?.fechaNacimiento || '',
    pais: usuario?.pais || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  const nombreCompleto = `${formData.nombre || ''} ${formData.apellido || ''}`.trim() || 'Usuario sin nombre';

  return (
    <Card className={className}>
      <div className="space-y-6">
        {/* Header con avatar y nombre */}
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                {nombreCompleto[0]}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {nombreCompleto}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {formData.email}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={usuario?.activo ? 'success' : 'danger'}>
                {usuario?.activo ? 'Activo' : 'Inactivo'}
              </Badge>
              {Array.isArray(usuario?.rol) ? (
                usuario.rol.map((role, index) => (
                  <Badge
                    key={index}
                    variant={
                      role === 'admin' ? 'danger' :
                      role === 'moderador' ? 'warning' : 'secondary'
                    }
                  >
                    {role === 'admin' ? '👑 Admin' :
                     role === 'moderador' ? '⚖️ Moderador' : '👤 Usuario'}
                  </Badge>
                ))
              ) : (
                <Badge
                  variant={
                    usuario?.rol === 'admin' ? 'danger' :
                    usuario?.rol === 'moderador' ? 'warning' : 'secondary'
                  }
                >
                  {usuario?.rol === 'admin' ? '👑 Admin' :
                   usuario?.rol === 'moderador' ? '⚖️ Moderador' : '👤 Usuario'}
                </Badge>
              )}
            </div>
          </div>

          {!editable && (
            <Button variant="outline" onClick={() => {/* Habilitar edición */}}>
              ✏️ Editar Perfil
            </Button>
          )}
        </div>

        {/* Información personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Información Personal
            </h3>

            <div className="space-y-3">
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                disabled={!editable}
              />

              <Input
                label="Apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                disabled={!editable}
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!editable}
              />

              <Input
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                disabled={!editable}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Información Adicional
            </h3>

            <div className="space-y-3">
              <Input
                label="Fecha de Nacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                disabled={!editable}
              />

              <Input
                label="País"
                value={formData.pais}
                onChange={(e) => handleInputChange('pais', e.target.value)}
                disabled={!editable}
              />

              {/* Información de registro */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Registrado:</span>
                    <span className="font-medium">
                      {usuario?.fechaRegistro ? formatDate(usuario.fechaRegistro) : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Último acceso:</span>
                    <span className="font-medium">
                      {usuario?.ultimoAcceso ? formatDate(usuario.ultimoAcceso) : 'Nunca'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas del usuario */}
        {usuario?.estadisticas && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Estadísticas de Actividad
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {usuario.estadisticas.partidosJugados || 0}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Partidos</div>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl font-bold text-green-700 dark:text-green-300">
                  {usuario.estadisticas.equiposCreados || 0}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Equipos</div>
              </div>

              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {usuario.estadisticas.competencias || 0}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Competencias</div>
              </div>

              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  {usuario.estadisticas.setsJugados || 0}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Sets</div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        {editable && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PerfilUsuario;
