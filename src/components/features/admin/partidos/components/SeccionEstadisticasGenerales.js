import React from 'react';
import EstadisticasGeneralesPartido from '../../../estadisticas/components/EstadisticasGeneralesPartido';

export function SeccionEstadisticasGenerales({
  partido,
  partidoId,
  token,
  onCambiarModoEstadisticas
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-blue-800">📊 Estadísticas Generales</h4>
          <p className="text-sm text-blue-700">
            {partido?.modoEstadisticas === 'manual'
              ? 'Modo Manual: Estadísticas totales del partido (ingresadas directamente)'
              : 'Modo Automático: Estadísticas detalladas por set individual'
            }
          </p>
        </div>
      </div>
      <EstadisticasGeneralesPartido
        key={`generales-${partido?.modoEstadisticas}-${partido?.modoVisualizacion}`}
        partidoId={partidoId}
        token={token}
        partido={partido}
        onCambiarModoEstadisticas={onCambiarModoEstadisticas}
      />
    </div>
  );
}
