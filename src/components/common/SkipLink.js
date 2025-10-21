// src/components/common/SkipLink.js
import React from 'react';
import './SkipLink.css';

/**
 * Componente SkipLink para mejorar la navegación por teclado
 * Permite saltar directamente a secciones importantes de la página
 */
const SkipLink = ({ href, children, className = '' }) => {
  return (
    <a
      href={href}
      className={`skip-link ${className}`}
      onFocus={(e) => e.target.style.opacity = '1'}
      onBlur={(e) => e.target.style.opacity = '0'}
    >
      {children}
    </a>
  );
};

/**
 * Componente que agrupa múltiples skip links
 */
export const SkipLinks = () => {
  return (
    <div className="skip-links-container">
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>
      <SkipLink href="#navigation">Saltar a la navegación</SkipLink>
      <SkipLink href="#search">Saltar a la búsqueda</SkipLink>
    </div>
  );
};

export default SkipLink;
