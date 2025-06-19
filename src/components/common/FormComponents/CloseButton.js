// src/components/common/CloseButton.js
import React from 'react';

export default function CloseButton({ onClick, ariaLabel = 'Cerrar', style }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        position: 'absolute',
        top: 10,
        right: 15,
        fontSize: 22,
        background: 'none',
        border: 'none',
        color: '#555',
        cursor: 'pointer',
        transition: 'color 0.2s',
        ...style,
      }}
    >
      ✖
    </button>
  );
}
