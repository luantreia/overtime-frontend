import React from 'react';
import CloseButton from '../../../common/FormComponents/CloseButton';

export default function ModalBase({ children, onClose, title }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-3xl w-full rounded shadow-lg p-6 overflow-auto max-h-[90vh] relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <CloseButton onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}
