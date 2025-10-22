// src/components/features/admin/components/ModalBase.jsx
import React from 'react';
import { Modal, Button } from '../../../ui';

/**
 * Componente ModalBase mejorado usando componentes UI reutilizables
 */
export default function ModalBase({
  children,
  onClose,
  title,
  size = 'lg',
  showCloseButton = true,
  footer,
  className = '',
  contentClassName = '',
  scrollable = true,
  maxHeightClass = 'max-h-[90vh]',
  bodyClassName = 'p-0',
  ...props
}) {
  const mergedClassName = [
    'flex',
    'flex-col',
    'overflow-hidden',
    scrollable ? maxHeightClass : '',
    className
  ].filter(Boolean).join(' ');

  const mergedContentClassName = [
    'flex-1',
    scrollable ? 'overflow-y-auto pr-1 custom-scrollbar' : '',
    contentClassName
  ].filter(Boolean).join(' ');

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size={size}
      className={mergedClassName}
      showCloseButton={showCloseButton}
      bodyClassName={bodyClassName}
      {...props}
    >
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      )}

      <div className={mergedContentClassName}>
        {children}
      </div>

      {footer && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </Modal>
  );
}
