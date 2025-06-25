// src/components/estadisticas/EncabezadoEstadisticas.js
import React from 'react';
import CloseButton from '../../common/FormComponents/CloseButton';

export default function EncabezadoEstadisticas({ onClose }) { // Removed onAgregarSet prop
  return (
    <div className="flex justify-between items-center mb-6 px-4 pt-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mr-auto">Captura de Estadísticas</h2>
      {/* Moved the "Nuevo Set" button out of here */}
      <CloseButton onClick={onClose} />
    </div>
  );
}