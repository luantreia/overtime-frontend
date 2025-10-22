import React from 'react';

export default function SeccionHistoricoEquiposYJugadores({ competenciaId, token }) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <h4 className="text-lg font-semibold text-green-800">Histórico de Equipos y Jugadores</h4>
      <p className="text-green-700">Vista histórica de equipos y jugadores que participaron en esta competencia.</p>
      <p className="text-sm text-green-600 mt-2">Competencia ID: {competenciaId}</p>
    </div>
  );
}
