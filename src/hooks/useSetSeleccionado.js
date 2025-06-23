// src/hooks/useSetSeleccionado.js
import { useMemo } from 'react';

export function useSetSeleccionado(numeroSetSeleccionado, sets) {
  return useMemo(() => {
    if (!numeroSetSeleccionado || !sets) return null;
    const n = parseInt(numeroSetSeleccionado, 10);
    return sets.find(s => s.numeroSet === n) || null;
  }, [numeroSetSeleccionado, sets]);
}
