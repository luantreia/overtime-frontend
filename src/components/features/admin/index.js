// src/components/features/admin/index.js
// Exportaciones del módulo de admin

export { default as AdminDashboard } from './AdminDashboard';
export { default as AdminDiagnostic } from './AdminDiagnostic';
export { default as PanelAdmin } from './PanelAdmin';
export { default as ModalBase } from './components/ModalBase';
export { default as EstadisticasCards } from './components/EstadisticasCards';
export { default as EquipoAdminCard } from './components/EquipoAdminCard';
export { default as AdminStats } from './components/AdminStats';
export { default as AdminPanel } from './components/AdminPanel';
export { default as AdminSeccionEntidades } from './components/AdminSeccionEntidades';

// Submódulos específicos de administración
export { default as SolicitudesContrato } from './solicitudes/SolicitudesContrato';
export { default as GestionCompetencias } from './competencias/GestionCompetencias';
export { default as GestionEquiposAdmin } from './equipos/GestionEquiposAdmin';
export { default as GestionJugadoresAdmin } from './jugadores/GestionJugadoresAdmin';
export { default as GestionOrganizacionesAdmin } from './organizaciones/GestionOrganizacionesAdmin';
export { default as GestionPartidosAdmin } from './partidos/GestionPartidosAdmin';

// Hooks específicos de admin
// export { default as useAdminStats } from './hooks/useAdminStats';
// export { default as useAdminPermissions } from './hooks/useAdminPermissions';

// Utils específicos de admin
// export { formatAdminData } from './utils/formatAdminData';
