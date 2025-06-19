// src/components/modals/ModalEstadisticasCaptura/SelectorSet.js
import React from 'react';
import SelectDropdown from '../../common/FormComponents/SelectDropdown';

export default function SelectorSet({ sets, numeroSetSeleccionado, setNumeroSetSeleccionado }) {
  // Adaptar opciones
    const opcionesSets = sets.map(s => ({
    value: s.numeroSet.toString(),
    label: `Set ${s.numeroSet}`
    }));

  return (
    <div style={{ marginBottom: 15, maxWidth: 200 }}>
      <SelectDropdown
        label="Seleccionar Set"
        name="selector-set"
        value={numeroSetSeleccionado}
        onChange={e => setNumeroSetSeleccionado(e.target.value)}
        options={opcionesSets}
        placeholder="-- Seleccione un set --"
      />
    </div>
  );
}
