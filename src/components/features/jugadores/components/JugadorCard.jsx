// src/components/features/jugadores/components/JugadorCard.jsx
import React from 'react';
import { useAuth } from '../../../../context/AuthContext';

/**
 * Componente JugadorCard para mostrar información de jugador en tarjetas
 */
const JugadorCard = ({
  jugador = {},
  onClick,
  showStats = true,
  compact = false,
  className = '',
  size = 'md',
  onAdminClick,
  user: userProp,
  rol: rolProp
}) => {
  const { nombre, apellido, equipo, estadisticas, foto } = jugador;

  const nombreCompleto = `${nombre || ''} ${apellido || ''}`.trim() || 'Jugador sin nombre';
  const equipoNombre = equipo?.nombre || 'Sin equipo';
  const escudo = equipo?.escudo;
  const nombreInicial = (nombreCompleto && nombreCompleto.charAt(0)) || '?';

  const { user: authUser, rol: authRol } = useAuth();
  const currentUser = userProp || authUser;
  const currentRol = rolProp || authRol;
  const isAdminGeneral = currentRol === 'admin';
  const isAdminJugador = Array.isArray(jugador?.administradores)
    ? jugador.administradores.includes(currentUser?.uid)
    : false;
  const isAdmin = Boolean(isAdminGeneral || isAdminJugador);

  // Tamaños y clases base alineados a EquipoCard
  const sizes = {
    sm: 'w-full max-w-xs h-40',
    md: 'w-full max-w-xs h-48 sm:h-60',
    lg: 'w-full max-w-sm h-56 sm:h-72'
  };

  const baseClasses = [
    'relative rounded-lg overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-in-out bg-white flex flex-col justify-end',
    'hover:scale-105 hover:shadow-2xl dark:bg-gray-800 dark:border dark:border-gray-600 dark:shadow-gray-900/50',
    compact ? sizes.sm : (sizes[size] || sizes.md),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} onClick={onClick}>
      {isAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onAdminClick) onAdminClick(jugador);
          }}
          className="absolute top-2 right-2 z-30 px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Abrir panel de administración"
        >
          ⚙️ Admin
        </button>
      )}
      {foto ? (
        <img
          src={foto}
          alt={nombreCompleto}
          className="absolute inset-0 w-full h-full object-cover z-10"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center z-10 select-none">
          <span className="text-4xl sm:text-6xl text-white font-bold drop-shadow-lg">
            {nombreInicial}
          </span>
        </div>
      )}
      {false && escudo && (
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full overflow-hidden border border-white shadow z-20">
          <img
            src={escudo}
            alt={equipoNombre || 'Equipo'}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <div className="relative z-20 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-70 text-white p-2 sm:p-3 text-center rounded-b-lg backdrop-blur-sm">
        <h3 className="m-0 text-sm sm:text-lg font-bold drop-shadow-md line-clamp-2">
          {nombreCompleto}
        </h3>
        {false && equipoNombre && (
          <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-gray-200 truncate`}>{equipoNombre}</p>
        )}
        {showStats && estadisticas && (
          <div className={`mt-1 flex items-center justify-between ${compact ? 'text-[11px]' : 'text-xs'} text-gray-200`}>
            <span>{estadisticas.totalPartidos || 0} partidos</span>
            <span>{estadisticas.partidosGanados || 0} victorias</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(JugadorCard);
