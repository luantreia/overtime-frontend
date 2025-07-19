import React from 'react';

export default function SeccionDatosEquipoCompetencia({ equipoCompetencia }) {
  if (!equipoCompetencia) return null;

  const { equipo, estado, fechaInicio, fechaFin, observaciones } = equipoCompetencia;

  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Datos del Equipo en la Competencia</h3>

      <div className="border rounded p-4 bg-white space-y-2">
        <div>
          <span className="font-semibold">Nombre oficial:</span>{' '}
          {equipo?.nombre || '—'}
        </div>
        <div>
          <span className="font-semibold">Estado del contrato:</span>{' '}
          <span className={`inline-block px-2 py-1 rounded text-sm ${estado === 'aceptado'
            ? 'bg-green-100 text-green-800'
            : estado === 'pendiente'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {estado}
          </span>
        </div>
        <div>
          <span className="font-semibold">Desde:</span>{' '}
          {fechaInicio ? new Date(fechaInicio).toLocaleDateString() : '—'}
        </div>
        <div>
          <span className="font-semibold">Hasta:</span>{' '}
          {fechaFin ? new Date(fechaFin).toLocaleDateString() : '—'}
        </div>
        {observaciones && (
          <div>
            <span className="font-semibold">Observaciones:</span>{' '}
            {observaciones}
          </div>
        )}
      </div>
    </section>
  );
}
