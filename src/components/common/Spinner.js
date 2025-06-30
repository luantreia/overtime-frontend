// src/components/common/Spinner.jsx
import React from 'react';

export default function Spinner({ mensaje = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-gray-600">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
      <p className="text-sm">{mensaje}</p>
    </div>
  );
}
