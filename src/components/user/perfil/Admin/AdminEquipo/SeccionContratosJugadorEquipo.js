import React from 'react';

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'N/A';
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return 'N/A';
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

export default function SeccionContratosJugadorEquipo({
  jugadoresEquipo,
  editandoContratoId,
  contratoEditado,
  setContratoEditado,
  setEditandoContratoId,
  guardarContratoEditado,
}) {
  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Contratos activos</h3>
      {jugadoresEquipo.length === 0 ? (
        <p className="text-gray-600">No hay jugadores asociados actualmente.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-300">
          <table className="min-w-[800px] table-auto text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Edad</th>
                <th className="px-4 py-2">Rol</th>
                <th className="px-4 py-2">Número</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Foto</th>
                <th className="px-4 py-2">Desde</th>
                <th className="px-4 py-2">Hasta</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jugadoresEquipo.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{c.jugador?.nombre}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{calcularEdad(c.jugador?.fechaNacimiento)}</td>
                  <td className="px-4 py-2">
                    {editandoContratoId === c._id ? (
                      <input
                        type="text"
                        className="input"
                        value={contratoEditado.rol || ''}
                        onChange={e => setContratoEditado({ ...contratoEditado, rol: e.target.value })}
                      />
                    ) : c.rol || '-'}
                  </td>
                  <td className="px-4 py-2">
                    {editandoContratoId === c._id ? (
                      <input
                        type="number"
                        className="input w-20"
                        value={contratoEditado.numero || ''}
                        onChange={e => setContratoEditado({ ...contratoEditado, numero: e.target.value })}
                      />
                    ) : c.numero || '-'}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {editandoContratoId === c._id ? (
                      <select
                        className="input"
                        value={contratoEditado.estado || c.estado}
                        onChange={e => setContratoEditado({ ...contratoEditado, estado: e.target.value })}
                      >
                        <option value="aceptado">Aceptado</option>
                        <option value="finalizado">Finalizado</option>
                      </select>
                    ) : c.estado}
                  </td>
                  <td className="px-4 py-2">
                    {editandoContratoId === c._id ? (
                      <input
                        type="text"
                        placeholder="URL foto"
                        className="input"
                        value={contratoEditado.foto || ''}
                        onChange={e => setContratoEditado({ ...contratoEditado, foto: e.target.value })}
                      />
                    ) : (
                      c.foto ? <a href={c.foto} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ver</a> : '-'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editandoContratoId === c._id ? (
                      <input
                        type="date"
                        className="input"
                        value={contratoEditado.desde || ''}
                        onChange={e => setContratoEditado({ ...contratoEditado, desde: e.target.value })}
                      />
                    ) : (
                      c.desde ? new Date(c.desde).toLocaleDateString() : '-'
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editandoContratoId === c._id ? (
                      <input
                        type="date"
                        className="input"
                        value={contratoEditado.hasta || ''}
                        onChange={e => setContratoEditado({ ...contratoEditado, hasta: e.target.value })}
                      />
                    ) : (
                      c.hasta ? new Date(c.hasta).toLocaleDateString() : '-'
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {['aceptado', 'finalizado'].includes(c.estado) ? (
                      editandoContratoId === c._id ? (
                        <div className="flex gap-2">
                          <button onClick={() => guardarContratoEditado(c._id)} className="btn-primary btn-xs">Guardar</button>
                          <button onClick={() => { setEditandoContratoId(null); setContratoEditado({}); }} className="btn-secondary btn-xs">Cancelar</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditandoContratoId(c._id);
                            setContratoEditado({
                              rol: c.rol || '',
                              numero: c.numero || '',
                              estado: c.estado,
                              foto: c.foto || '',
                              desde: c.desde?.slice(0, 10) || '',
                              hasta: c.hasta?.slice(0, 10) || ''
                            });
                          }}
                          className="btn-outline btn-xs"
                        >
                          Editar
                        </button>
                      )
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
