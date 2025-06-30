import React from 'react';
import { useEquipoCompetencia } from '../../../hooks/useEquiposCompetencia';
export default function EditorEquiposFase({ competenciaId, tipoFase }) {
  const {
    equiposCompetencia,
    editarEquipoCompetencia,
    loading,
    error
  } = useEquipoCompetencia(competenciaId);

  const handleChange = (id, campo, valor) => {
    editarEquipoCompetencia(id, { [campo]: valor });
  };

  if (loading) return <p className="text-gray-500">Cargando equipos...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!equiposCompetencia.length) return <p>No hay equipos en esta competencia.</p>;

  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-lg font-semibold mb-2">
        Asignar {tipoFase === 'grupo' ? 'grupo' : 'división'} a equipos
      </h3>
      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Equipo</th>
            <th className="p-2 text-left">{tipoFase === 'grupo' ? 'Grupo' : 'División'}</th>
          </tr>
        </thead>
        <tbody>
          {equiposCompetencia.map((eq) => (
            <tr key={eq._id} className="border-t">
              <td className="p-2">{eq.equipo?.nombre || 'Sin nombre'}</td>
              <td className="p-2">
                {tipoFase === 'grupo' ? (
                  <input
                    type="text"
                    value={eq.grupo || ''}
                    onChange={(e) => handleChange(eq._id, 'grupo', e.target.value)}
                    className="border px-2 py-1 rounded w-24"
                    placeholder="Ej: A"
                  />
                ) : (
                  <select
                    value={eq.division || ''}
                    onChange={(e) => handleChange(eq._id, 'division', e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Sin asignar</option>
                    <option value="A">División A</option>
                    <option value="B">División B</option>
                    <option value="C">División C</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
