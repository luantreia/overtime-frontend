// src/components/common/ModalLayout.js
import React from 'react';

export default function ModalLayout({ children, onClose, className = '', maxWidth = 'max-w-4xl' }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-start sm:items-center p-2 sm:p-4 z-[1200]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto relative ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
