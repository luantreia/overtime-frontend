// src/hooks/common/useBreakpoint.js
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar breakpoints de pantalla
 * Útil para componentes que necesitan comportarse diferente en diferentes tamaños
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('md');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setBreakpoint('xs');
      } else if (width < 768) {
        setBreakpoint('sm');
      } else if (width < 1024) {
        setBreakpoint('md');
      } else if (width < 1280) {
        setBreakpoint('lg');
      } else if (width < 1536) {
        setBreakpoint('xl');
      } else {
        setBreakpoint('2xl');
      }

      setDimensions({ width, height: window.innerHeight });
    };

    // Actualizar inmediatamente
    updateBreakpoint();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  // Helpers convenientes
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = ['lg', 'xl', '2xl'].includes(breakpoint);
  const isLargeScreen = breakpoint === 'xl' || breakpoint === '2xl';

  return {
    breakpoint,
    dimensions,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
  };
};
