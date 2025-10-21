// src/components/estadisticas/CacheInfo.js
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Componente informativo sobre el comportamiento del cache durante capturas
 */
const CacheInfo = ({ className = '' }) => {
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <InformationCircleIcon className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
        <div className="text-sm">
          <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
            💾 Información sobre Cache de Datos
          </h4>
          <div className={`space-y-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            <p>• <strong>Datos frescos:</strong> Se mantienen disponibles por 15 minutos sin recargar</p>
            <p>• <strong>Datos guardados:</strong> Tus cambios se envían inmediatamente al servidor</p>
            <p>• <strong>Sin pérdida de trabajo:</strong> Los datos sin guardar permanecen en el formulario</p>
            <p>• <strong>Recuperación automática:</strong> Si pierdes conexión, puedes continuar capturando</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheInfo;
