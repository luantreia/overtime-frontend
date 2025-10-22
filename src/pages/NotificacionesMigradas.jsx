// src/pages/NotificacionesMigradas.jsx
// Ejemplo de página de Notificaciones usando los nuevos módulos

import React from 'react';
import { Notificaciones } from '../components/features/notificaciones';

export default function NotificacionesMigradas() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Centro de Notificaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Mantente al día con todas tus notificaciones
          </p>
        </div>

        {/* Componente de notificaciones usando nuevo módulo */}
        <Notificaciones />
      </div>
    </div>
  );
}
