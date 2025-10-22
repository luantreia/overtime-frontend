// src/pages/ConfiguracionMigrada.jsx
// Ejemplo de página de Configuración usando los nuevos módulos

import React from 'react';
import { Configuracion } from '../components/features/configuracion';

export default function ConfiguracionMigrada() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Centro de Configuración
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personaliza tu experiencia en la aplicación
          </p>
        </div>

        {/* Componente de configuración usando nuevo módulo */}
        <Configuracion />
      </div>
    </div>
  );
}
