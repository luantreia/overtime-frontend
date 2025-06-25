// components/modals/ModalEquipo/SeccionEstadisticas.js
import React from 'react';

export default function SeccionEstadisticas({ copas, puntos, racha }) {
  return (
    <div className="w-full lg:w-[calc(33.33%-10px)] bg-gray-100 p-4 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-2">Estadísticas Clave</h3>
      <p><span role="img" aria-label="copas">🏆</span> Copas: {copas || 0}</p>
      <p><span role="img" aria-label="puntos">💥</span> Puntos: {puntos || 0}</p>
      <p><span role="img" aria-label="fuego">🔥</span> Racha: {racha || 'N/A'}</p>
    </div>
  );
}

