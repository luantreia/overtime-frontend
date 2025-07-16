import React from 'react';

const TIPO_ORDEN = ['grupo', 'liga', 'playoff', 'promocion', 'otro'];

export default function DiagramaFases({ fases }) {
  // Agrupar fases por tipo
  const fasesPorTipo = {};
  TIPO_ORDEN.forEach((tipo) => {
    fasesPorTipo[tipo] = fases.filter((f) => f.tipo === tipo);
  });

  return (
    <div className="overflow-auto bg-white rounded shadow p-4">
      <div className="grid grid-cols-5 gap-6">
        {TIPO_ORDEN.map((tipo) => (
          <div key={tipo} className="border p-3 rounded">
            <h3 className="font-bold text-lg mb-2 capitalize">{tipo}</h3>

            {tipo === 'liga' ? (
              // Agrupar ligas por división
              ['A', 'B', 'C', ''].map((division) => {
                const fasesDivision = fasesPorTipo[tipo].filter(
                  (f) => (f.division || '') === division
                );
                if (fasesDivision.length === 0) return null;

                return (
                  <div key={division} className="mb-4">
                    {division && (
                      <h4 className="font-semibold text-sm text-blue-700 mb-1">
                        División {division}
                      </h4>
                    )}
                    <ul className="space-y-1">
                      {fasesDivision.map((fase) => (
                        <li
                          key={fase._id}
                          className="p-2 border rounded hover:bg-blue-50 cursor-pointer"
                          title={`Desde: ${fase.fechaInicio ? new Date(fase.fechaInicio).toLocaleDateString() : '-'} | Hasta: ${
                            fase.fechaFin ? new Date(fase.fechaFin).toLocaleDateString() : '-'
                          }`}
                        >
                          <div className="font-medium">{fase.nombre}</div>
                          <div className="text-xs text-gray-600">
                            {fase.fechaInicio && `Inicio: ${new Date(fase.fechaInicio).toLocaleDateString()}`} <br />
                            {fase.fechaFin && `Fin: ${new Date(fase.fechaFin).toLocaleDateString()}`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            ) : (
              <ul className="space-y-1">
                {fasesPorTipo[tipo].length === 0 ? (
                  <li className="text-gray-400 text-sm italic">No hay fases</li>
                ) : (
                  fasesPorTipo[tipo].map((fase) => (
                    <li
                      key={fase._id}
                      className="p-2 border rounded hover:bg-green-50 cursor-pointer"
                      title={`Desde: ${fase.fechaInicio ? new Date(fase.fechaInicio).toLocaleDateString() : '-'} | Hasta: ${
                        fase.fechaFin ? new Date(fase.fechaFin).toLocaleDateString() : '-'
                      }`}
                    >
                      <div className="font-medium">{fase.nombre}</div>
                      <div className="text-xs text-gray-600">
                        {fase.fechaInicio && `Inicio: ${new Date(fase.fechaInicio).toLocaleDateString()}`} <br />
                        {fase.fechaFin && `Fin: ${new Date(fase.fechaFin).toLocaleDateString()}`}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
