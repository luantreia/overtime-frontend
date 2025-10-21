// src/hooks/common/useAccessibility.js
import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para mejorar la accesibilidad de componentes
 * Proporciona navegación por teclado, manejo de focus y ARIA labels
 */
export const useAccessibility = (options = {}) => {
  const {
    trapFocus = false,
    initialFocus = null,
    returnFocus = true,
    ariaLabel = '',
    role = '',
  } = options;

  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Función para obtener elementos enfocables
  const getFocusableElements = (container = document) => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'iframe',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', ')))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  };

  // Trap focus dentro del contenedor (útil para modales)
  const trapFocusInContainer = (event) => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: ir al elemento anterior
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: ir al siguiente elemento
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    // Escape: salir del trap focus
    if (event.key === 'Escape' && options.onEscape) {
      options.onEscape();
    }
  };

  // Configurar accesibilidad
  useEffect(() => {
    if (trapFocus && containerRef.current) {
      // Guardar el elemento que tenía foco antes
      previousFocusRef.current = document.activeElement;

      // Configurar event listeners
      containerRef.current.addEventListener('keydown', trapFocusInContainer);

      // Enfocar el elemento inicial
      if (initialFocus) {
        setTimeout(() => initialFocus.focus(), 100);
      } else {
        // Enfocar el primer elemento enfocable
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          setTimeout(() => focusableElements[0].focus(), 100);
        }
      }
    }

    return () => {
      if (trapFocus && containerRef.current) {
        containerRef.current.removeEventListener('keydown', trapFocusInContainer);

        // Restaurar foco al elemento anterior
        if (returnFocus && previousFocusRef.current) {
          setTimeout(() => previousFocusRef.current.focus(), 100);
        }
      }
    };
  }, [trapFocus, initialFocus, returnFocus]);

  // Función para anunciar contenido a lectores de pantalla
  const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remover después de que se anuncie
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Función para manejar navegación por teclado
  const handleKeyboardNavigation = (event, actions) => {
    const { onEnter, onSpace, onArrowUp, onArrowDown, onEscape } = actions;

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace(event);
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
    }
  };

  return {
    containerRef,
    announceToScreenReader,
    handleKeyboardNavigation,
    getFocusableElements,
    // Props de accesibilidad comunes
    accessibilityProps: {
      'aria-label': ariaLabel,
      role: role,
      tabIndex: trapFocus ? 0 : undefined,
    }
  };
};
