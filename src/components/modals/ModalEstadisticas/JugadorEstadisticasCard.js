// src/components/modals/ModalEstadisticasCaptura/JugadorEstadisticasCard.js
import React from 'react';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';

export default function JugadorEstadisticasCard({
  index,
  jugadorId,
  opcionesJugadores,
  onCambiarJugador,
  onCambiarEstadistica,
  estadisticasJugador = { throws: 0, hits: 0, outs: 0, catches: 0 },
}) {
  const controles = [
    { campo: 'throws', label: 'Throws' },
    { campo: 'hits', label: 'Hits' },
    { campo: 'outs', label: 'Outs' },
    { campo: 'catches', label: 'Catches' },
  ];

  return (
    <div className="jugador-card">
      <SelectDropdown
        label={null}
        name={`jugador-${index}`}
        value={jugadorId}
        options={opcionesJugadores}
        onChange={(e) => onCambiarJugador(e.target.value)}
        placeholder="Seleccione jugador"
      />

      <div className="estadisticas-controles">
        {controles.map(({ campo, label }) => {
          const valor = estadisticasJugador[campo] || 0;
          return (
            <div key={campo} className="estadistica-item">
              <span className="campo-label">{label}</span>
              <div className="contador">
                <button onClick={() => onCambiarEstadistica(campo, -1)} disabled={valor <= 0}>-</button>
                <span>{valor}</span>
                <button onClick={() => onCambiarEstadistica(campo, +1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
