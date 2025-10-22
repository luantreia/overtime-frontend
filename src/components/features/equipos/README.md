// Ejemplo de cómo se vería la página de Equipos con la nueva estructura

// ✅ Antes:
// import TarjetaEquipo from '../components/modals/ModalEquipo/tarjetaequipo.js';
// import ModalEquipo from '../components/modals/ModalEquipo/ModalEquipo.js';

// ✅ Después:
import { TarjetaEquipo, ModalEquipo } from '../components/features/equipos';
import TimelineEquipos from '../components/common/timeline/TimelineEquipos.js';
import { useEquipos } from '../hooks/equipos/useEquipos.js';
import { useAuth } from '../context/AuthContext.js';
import { ITEMS_PER_PAGE } from '../utils/constants';

// También se puede usar desde el índice centralizado:
// import { TarjetaEquipo, ModalEquipo } from '../components/features/equipos';
// import { Spinner } from '../ui';
// import { formatDate } from '../utils';
