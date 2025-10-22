// src/components/features/configuracion/components/ConfiguracionSistema.jsx
import React, { useState } from 'react';
import { Card, Badge, Button, Input, Select, Spinner } from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';

/**
 * Componente para configuración general del sistema
 */
const ConfiguracionSistema = () => {
  const { user } = useAuth();
  const { get, put, loading } = useApi();
  const [configuracion, setConfiguracion] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Verificar permisos de admin
  if (!user?.rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para configurar el sistema</p>
      </Card>
    );
  }

  // Cargar configuración actual
  React.useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const data = await get('/api/admin/configuracion');
      setConfiguracion(data);
    } catch (err) {
      console.error('Error cargando configuración:', err);
    }
  };

  const handleConfigChange = (campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      await put('/api/admin/configuracion', configuracion);
      // Mostrar mensaje de éxito
    } catch (err) {
      console.error('Error guardando configuración:', err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuración del Sistema
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Configuración general de la aplicación
            </p>
          </div>
          <Badge variant="primary">Modo Admin</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración general */}
          <Card title="Configuración General">
            <div className="space-y-4">
              <Input
                label="Nombre de la aplicación"
                value={configuracion.nombreAplicacion || ''}
                onChange={(e) => handleConfigChange('nombreAplicacion', e.target.value)}
              />

              <Input
                label="Descripción"
                value={configuracion.descripcion || ''}
                onChange={(e) => handleConfigChange('descripcion', e.target.value)}
              />

              <Select
                label="Idioma por defecto"
                value={configuracion.idiomaDefecto || 'es'}
                onChange={(e) => handleConfigChange('idiomaDefecto', e.target.value)}
                options={[
                  { value: 'es', label: 'Español' },
                  { value: 'en', label: 'English' },
                  { value: 'pt', label: 'Português' }
                ]}
              />

              <Select
                label="Zona horaria"
                value={configuracion.zonaHoraria || 'America/Argentina/Buenos_Aires'}
                onChange={(e) => handleConfigChange('zonaHoraria', e.target.value)}
                options={[
                  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
                  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
                  { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' }
                ]}
              />
            </div>
          </Card>

          {/* Configuración de seguridad */}
          <Card title="Configuración de Seguridad">
            <div className="space-y-4">
              <Select
                label="Política de contraseñas"
                value={configuracion.politicaContrasenas || 'media'}
                onChange={(e) => handleConfigChange('politicaContrasenas', e.target.value)}
                options={[
                  { value: 'basica', label: 'Básica (8 caracteres)' },
                  { value: 'media', label: 'Media (8 caracteres + números)' },
                  { value: 'alta', label: 'Alta (12 caracteres + símbolos)' }
                ]}
              />

              <Input
                label="Tiempo de sesión (minutos)"
                type="number"
                value={configuracion.tiempoSesion || 60}
                onChange={(e) => handleConfigChange('tiempoSesion', parseInt(e.target.value))}
              />

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requiereVerificacionEmail"
                  checked={configuracion.requiereVerificacionEmail || false}
                  onChange={(e) => handleConfigChange('requiereVerificacionEmail', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="requiereVerificacionEmail" className="text-sm text-gray-700 dark:text-gray-300">
                  Requerir verificación de email
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="habilitarRegistro"
                  checked={configuracion.habilitarRegistro || false}
                  onChange={(e) => handleConfigChange('habilitarRegistro', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="habilitarRegistro" className="text-sm text-gray-700 dark:text-gray-300">
                  Permitir registro de nuevos usuarios
                </label>
              </div>
            </div>
          </Card>

          {/* Configuración de notificaciones */}
          <Card title="Configuración de Notificaciones">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notificacionesEmail"
                  checked={configuracion.notificacionesEmail || false}
                  onChange={(e) => handleConfigChange('notificacionesEmail', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="notificacionesEmail" className="text-sm text-gray-700 dark:text-gray-300">
                  Habilitar notificaciones por email
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notificacionesPush"
                  checked={configuracion.notificacionesPush || false}
                  onChange={(e) => handleConfigChange('notificacionesPush', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="notificacionesPush" className="text-sm text-gray-700 dark:text-gray-300">
                  Habilitar notificaciones push
                </label>
              </div>

              <Input
                label="Email del administrador"
                type="email"
                value={configuracion.emailAdmin || ''}
                onChange={(e) => handleConfigChange('emailAdmin', e.target.value)}
              />
            </div>
          </Card>

          {/* Configuración de rendimiento */}
          <Card title="Configuración de Rendimiento">
            <div className="space-y-4">
              <Input
                label="Máximo de elementos por página"
                type="number"
                value={configuracion.maxElementosPagina || 20}
                onChange={(e) => handleConfigChange('maxElementosPagina', parseInt(e.target.value))}
              />

              <Input
                label="Timeout de API (segundos)"
                type="number"
                value={configuracion.timeoutApi || 30}
                onChange={(e) => handleConfigChange('timeoutApi', parseInt(e.target.value))}
              />

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="habilitarCache"
                  checked={configuracion.habilitarCache || false}
                  onChange={(e) => handleConfigChange('habilitarCache', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="habilitarCache" className="text-sm text-gray-700 dark:text-gray-300">
                  Habilitar caché del navegador
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={cargarConfiguracion}>
            Restaurar
          </Button>
          <Button
            variant="primary"
            onClick={handleGuardar}
            loading={guardando}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfiguracionSistema;
