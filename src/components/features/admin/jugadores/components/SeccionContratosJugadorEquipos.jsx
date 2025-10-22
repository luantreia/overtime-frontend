import React from 'react';

export default function SeccionContratosJugador({ contratos }) {
  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Relaciones jugador-equipo</h3>
      {contratos.length === 0 ? (
        <p>No tiene relaciones activas.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Equipo</th>
                <th className="px-3 py-2 text-left font-medium">Rol</th>
                <th className="px-3 py-2 text-left font-medium">Número</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                <th className="px-3 py-2 text-left font-medium">Desde</th>
                <th className="px-3 py-2 text-left font-medium">Hasta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contratos.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{c.equipo?.nombre || 'Equipo desconocido'}</td>
                  <td className="px-3 py-2">{c.rol || '-'}</td>
                  <td className="px-3 py-2">{c.numero || '-'}</td>
                  <td className="px-3 py-2 capitalize">{c.estado || '-'}</td>
                  <td className="px-3 py-2">{c.desde ? c.desde.substring(0, 10) : '-'}</td>
                  <td className="px-3 py-2">{c.hasta ? c.hasta.substring(0, 10) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
