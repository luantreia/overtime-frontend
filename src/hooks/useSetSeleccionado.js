// src/hooks/useSetSeleccionado.js
import { useMemo } from 'react';

export function useSetSeleccionado(numeroSet, sets) {
  return useMemo(() => {
    if (!numeroSet) return null;
    return sets.find(s => s.numeroSet === Number(numeroSet)) || null;
  }, [numeroSet, sets]);
}
