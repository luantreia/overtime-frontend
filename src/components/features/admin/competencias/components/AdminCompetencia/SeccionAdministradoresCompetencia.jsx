import React from 'react';

export default function SeccionAdministradoresCompetencia({ competenciaId, token }) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <h4 className="text-lg font-semibold text-yellow-800">Sección en Desarrollo</h4>
      <p className="text-yellow-700">La gestión de administradores para competencias estará disponible próximamente.</p>
      <p className="text-sm text-yellow-600 mt-2">Competencia ID: {competenciaId}</p>
    </div>
  );
}
