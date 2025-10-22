import React from 'react';

export default function SeccionTemporadasCompetencia({ competenciaId, token }) {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h4 className="text-lg font-semibold text-blue-800">Gestión de Temporadas</h4>
      <p className="text-blue-700">Aquí podrás gestionar las temporadas de la competencia.</p>
      <p className="text-sm text-blue-600 mt-2">Competencia ID: {competenciaId}</p>
    </div>
  );
}
