// Ejemplo de actualización de imports en la página Equipos

// ✅ ANTES (estructura antigua):
import TarjetaEquipo from '../components/modals/ModalEquipo/tarjetaequipo.js';
import ModalEquipo from '../components/modals/ModalEquipo/ModalEquipo.js';
import TimelineEquipos from '../components/common/timeline/TimelineEquipos.js';
import { useEquipos } from '../hooks/equipos/useEquipos.js';
import { useAuth } from '../context/AuthContext.js';

// ✅ DESPUÉS (estructura nueva):
import { TarjetaEquipo, ModalEquipo } from '../components/features/equipos';
import TimelineEquipos from '../components/common/timeline/TimelineEquipos.js';
import { useEquipos } from '../hooks/equipos/useEquipos.js';
import { useAuth } from '../context/AuthContext.js';

// ✅ O usando importaciones centralizadas:
// import { TarjetaEquipo, ModalEquipo } from '../components/features/equipos';
// import { ITEMS_PER_PAGE } from '../utils/constants';
// import { Spinner } from '../ui';

// Beneficios:
// - ✅ Imports más cortos y limpios
// - ✅ Mejor organización por dominio
// - ✅ Fácil de encontrar y mantener
// - ✅ Reutilización máxima de código
