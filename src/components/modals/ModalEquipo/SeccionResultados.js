// components/modals/ModalEquipo/SeccionResultados.js
import React from 'react';

export default function SeccionResultados({ resultados }) {
  return (
    <div className="w-full lg:w-[calc(66.66%-10px)] bg-gray-100 p-4 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-2">Últimos Resultados</h3>
      <ul>
        {resultados?.length > 0 ? (
          resultados.map((r, i) => <li key={i}>{r}</li>)
        ) : (
          <li>Sin datos</li>
        )}
      </ul>
    </div>
  );
}
