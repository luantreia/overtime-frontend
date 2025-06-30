// src/components/ModalCompetencia/Secciones/TablaPosiciones.js
import React from 'react';

export default function TablaPosiciones({ equipos }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full table-auto text-sm text-left">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">Equipo</th>
            <th className="p-2">PJ</th>
            <th className="p-2">PG</th>
            <th className="p-2">PE</th>
            <th className="p-2">PP</th>
            <th className="p-2">Pts</th>
            <th className="p-2">Dif</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((eq, i) => (
            <tr key={eq._id} className="border-b hover:bg-gray-100">
              <td className="p-2 font-semibold">{i + 1}</td>
              <td className="p-2">{eq.equipo?.nombre || 'Equipo'}</td>
              <td className="p-2">{eq.partidosJugados}</td>
              <td className="p-2">{eq.partidosGanados}</td>
              <td className="p-2">{eq.partidosEmpatados}</td>
              <td className="p-2">{eq.partidosPerdidos}</td>
              <td className="p-2 font-bold">{eq.puntos}</td>
              <td className="p-2">{eq.diferenciaPuntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
