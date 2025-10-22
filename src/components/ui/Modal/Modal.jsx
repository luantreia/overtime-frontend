// src/components/ui/Modal/Modal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Componente Modal reutilizable mejorado
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  showCloseButton = true,
  bodyClassName = 'px-6 py-4',
  ...props
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  const modalClasses = [
    'relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all',
    'flex flex-col',
    sizes[size],
    className
  ].filter(Boolean).join(' ');

  const headerClasses = 'px-6 py-4 border-b border-gray-200 dark:border-gray-700';

  const bodyClasses = [
    'px-6 py-4',
    'overflow-x-hidden',
    bodyClassName
  ].filter(Boolean).join(' ');

  const overlayClasses = [
    'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    overlayClassName
  ].filter(Boolean).join(' ');

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={overlayClasses} onClick={handleBackdropClick}>
      <div className={modalClasses} {...props}>
        {(title || subtitle) && (
          <div className={headerClasses}>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={bodyClasses}>
          {children}
        </div>

        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
