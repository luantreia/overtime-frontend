// src/components/features/notificaciones/Notificaciones.jsx
import React, { useState } from 'react';
import { Card, Badge, Button } from '../../ui';
import ListaNotificaciones from './components/ListaNotificaciones';

/**
 * Componente principal de notificaciones con navegación
 */
const Notificaciones = () => {
  const [vistaActiva, setVistaActiva] = useState('lista');

  const vistas = [
    { id: 'lista', label: 'Todas las notificaciones', icon: '📋' },
    { id: 'importantes', label: 'Importantes', icon: '⭐' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' }
  ];

  const renderContenido = () => {
    switch (vistaActiva) {
      case 'lista':
        return <ListaNotificaciones />;

      case 'importantes':
        return (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notificaciones importantes
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Vista de notificaciones importantes en desarrollo...
              </p>
            </div>
          </Card>
        );

      case 'configuracion':
        return (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Configuración de notificaciones
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Configuración de notificaciones en desarrollo...
              </p>
            </div>
          </Card>
        );

      default:
        return <ListaNotificaciones />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas */}
      <Card>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {vistas.map((vista) => (
              <button
                key={vista.id}
                onClick={() => setVistaActiva(vista.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  vistaActiva === vista.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{vista.icon}</span>
                {vista.label}
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Contenido de la vista activa */}
      {renderContenido()}
    </div>
  );
};

export default Notificaciones;
