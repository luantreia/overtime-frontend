// src/components/common/PageContainer.js
import React from 'react';

/**
 * Componente contenedor responsive para páginas
 * Proporciona padding y espaciado consistente en diferentes dispositivos
 */
const PageContainer = ({
  children,
  className = '',
  maxWidth = 'max-w-7xl',
  padding = 'p-4 sm:p-6 lg:p-8'
}) => {
  return (
    <div className={`w-full mx-auto ${maxWidth} ${padding} ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
