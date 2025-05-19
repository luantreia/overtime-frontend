import React from 'react';

export default function ErrorMessage({ mensaje }) {
  if (!mensaje) return null;

  return (
    <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm border border-red-300">
      {mensaje}
    </div>
  );
}
