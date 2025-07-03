import React from 'react';
import EditorEquiposFase from './EditorEquiposFase';
import CloseButton from '../../common/FormComponents/CloseButton';

export default function ModalEditorEquiposFase({ competenciaId, tipoFase, fases, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editar equipos de fase</h2>
          <CloseButton onClick={onClose} />
        </div>

        <EditorEquiposFase competenciaId={competenciaId} tipoFase={tipoFase} fases={fases} />
      </div>
    </div>
  );
}

