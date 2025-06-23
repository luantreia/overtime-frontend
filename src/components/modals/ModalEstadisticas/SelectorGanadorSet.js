// SelectorGanadorSet.js
import React from 'react';

export default function SelectorGanadorSet({ ganadorSet, setGanadorSet, modalidad }) {
  const opciones = [
    { valor: 'local', label: 'Equipo Local' },
    { valor: 'visitante', label: 'Equipo Visitante' },
    ...(modalidad === 'Cloth' ? [{ valor: 'empate', label: 'Empate' }] : []),
    { valor: 'pendiente', label: 'Pendiente' }
  ];

  return (
    <div className="mb-4">
      <label>Ganador del set:</label>
      <select
        className="ml-2 p-1 border rounded"
        value={ganadorSet}
        onChange={e => setGanadorSet(e.target.value)}
      >
        {opciones.map(op => (
          <option key={op.valor} value={op.valor}>{op.label}</option>
        ))}
      </select>
    </div>
  );
}
