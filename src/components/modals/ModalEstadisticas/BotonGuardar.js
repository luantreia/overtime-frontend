// src/components/modals/ModalEstadisticasCaptura/BotonGuardar.js
import React from 'react';

export default function BotonGuardar({ onClick, disabled }) {
  return (
    <button
      style={{
        marginTop: 30,
        backgroundColor: disabled ? '#94d3a2' : '#28a745',
        color: 'white',
        padding: '10px 18px',
        border: 'none',
        borderRadius: 6,
        fontSize: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      Guardar estadísticas
    </button>
  );
}
