import React from 'react';
import CloseButton from '../../../ui/FormComponents/CloseButton';

export default function ModalBase({
  children,
  onClose,
  title,
  maxWidth = 'max-w-4xl',
  className = ''
}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-start sm:items-center p-2 sm:p-4 z-[1200]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto relative ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600">
          <h2
            id="modal-title"
            className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200 pr-4"
          >
            {title}
          </h2>
          <CloseButton
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 text-xl sm:text-2xl flex-shrink-0"
          />
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
