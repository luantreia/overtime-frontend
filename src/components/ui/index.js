// src/components/ui/index.js
// Exportaciones centralizadas de componentes UI

export { default as Button } from './Button/Button';
export { default as Input } from './Input/Input';
export { default as Select } from './Select/Select';
export { default as Spinner } from './Spinner/Spinner';
export { default as Card } from './Card/Card';
export { default as Badge } from './Badge/Badge';
export { default as Table } from './Table/Table';
export { default as Modal } from './Modal/Modal';
export { default as FilterControls } from './Filter/FilterControls';

// Re-exportar componentes comunes existentes para compatibilidad
export { default as ModalLayout } from '../common/ModalLayout';
export { default as ThemeToggle } from '../common/ThemeToggle';
export { default as ErrorBoundary } from '../common/ErrorBoundary';
