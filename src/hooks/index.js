// src/hooks/index.js
// Exportaciones centralizadas de hooks

// Hooks UI
export { default as useForm } from './ui/useForm';

// Hooks API
export { default as useApi } from './api/useApi';

// Hooks de dominio existentes (para compatibilidad)
export { useEquipos } from './equipos/useEquipos';
export { default as useJugadores } from './jugadores/useJugadores';
export { usePartidos } from './partidos/usePartidos';

// Hook de ping
export { usePing } from './usePing';

// Módulos de features (nuevos)
// Los módulos de features tienen sus propios hooks internos
// Ejemplo: import { useEquipoStats } from '../components/features/equipos';
