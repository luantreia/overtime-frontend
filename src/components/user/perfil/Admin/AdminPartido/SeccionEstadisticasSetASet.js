import React, { useState } from 'react';
import GraficoEstadisticasSet from './GraficoEstadisticasSet';

export function SeccionEstadisticasSetASet({ partido, token }) {
  const [setsExpandidos, setSetsExpandidos] = useState({});

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-purple-800">🎯 Estadísticas Set a Set</h4>
          <p className="text-sm text-purple-700">Análisis detallado de cada set individual del partido</p>
        </div>
      </div>
      {partido.sets && partido.sets.length > 0 ? (
        <div className="space-y-3">
          {partido.sets.map(set => {
            const isExpanded = setsExpandidos[set._id];

            return (
              <div key={set._id} className="bg-white rounded border">
                {/* Header del set */}
                <div
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSetsExpandidos(prev => ({
                    ...prev,
                    [set._id]: !prev[set._id]
                  }))}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-medium text-lg">Set {set.numeroSet}</span>
                    <span className="text-sm text-gray-600">
                      Estado: <span className="font-medium">{set.estadoSet}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Ganador: <span className="font-medium">{set.ganadorSet}</span>
                    </span>
                  </div>
                </div>

                {/* Estadísticas expandidas */}
                {isExpanded && (
                  <div className="border-t px-3 pb-3">
                    <GraficoEstadisticasSet setId={set._id} token={token} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600">No hay sets creados aún. Crea sets para ver estadísticas detalladas.</p>
      )}
    </div>
  );
}
