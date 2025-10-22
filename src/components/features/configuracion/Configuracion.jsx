// src/components/features/configuracion/Configuracion.jsx
import React, { useState } from 'react';
import { Card, Badge, Button } from '../../ui';
import ConfiguracionSistema from './components/ConfiguracionSistema';
import ConfiguracionApariencia from './components/ConfiguracionApariencia';

/**
 * Componente principal de configuración con pestañas
 */
const Configuracion = () => {
  const [pestanaActiva, setPestanaActiva] = useState('sistema');

  const pestañas = [
    { id: 'sistema', label: 'Sistema', icon: '⚙️' },
    { id: 'apariencia', label: 'Apariencia', icon: '🎨' },
    { id: 'seguridad', label: 'Seguridad', icon: '🔒' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '🔔' }
  ];

  const renderContenido = () => {
    switch (pestanaActiva) {
      case 'sistema':
        return <ConfiguracionSistema />;
      case 'apariencia':
        return <ConfiguracionApariencia />;
      case 'seguridad':
        return (
          <Card>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Configuración de seguridad en desarrollo...
            </p>
          </Card>
        );
      case 'notificaciones':
        return (
          <Card>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Configuración de notificaciones en desarrollo...
            </p>
          </Card>
        );
      default:
        return <ConfiguracionSistema />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas */}
      <Card>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {pestañas.map((pestaña) => (
              <button
                key={pestaña.id}
                onClick={() => setPestanaActiva(pestaña.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  pestanaActiva === pestaña.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{pestaña.icon}</span>
                {pestaña.label}
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Contenido de la pestaña activa */}
      {renderContenido()}
    </div>
  );
};

export default Configuracion;
