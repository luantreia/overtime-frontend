// src/components/estadisticas/EncabezadoEstadisticas.js
import React from 'react';
import Button from '../../common/FormComponents/Button';
import CloseButton from '../../common/FormComponents/CloseButton';

export default function EncabezadoEstadisticas({ onAgregarSet, onClose }) {
  return (
    <div style={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <h2>Captura de Estadísticas</h2>
      <div>
        <Button onClick={onAgregarSet} variant="primary">Nuevo Set</Button>
        <CloseButton onClick={onClose} />
      </div>
    </div>
  );
}
