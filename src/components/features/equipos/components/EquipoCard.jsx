// src/components/features/equipos/components/EquipoCard.jsx
import React from 'react';
import { useAuth } from '../../../../context/AuthContext';

/**
 *EquipoCard reutilizable con diseño mejorado
 */
const EquipoCard = React.memo(function EquipoCard({
  nombre,
  onClick,
  escudo,
  className = '',
  size = 'md',
  equipo,
  onAdminClick,
  user: userProp,
  rol: rolProp
}) {
  const tieneEscudo = escudo && escudo.trim() !== '';

  const { user: authUser, rol: authRol } = useAuth();
  const currentUser = userProp || authUser;
  const currentRol = rolProp || authRol;
  const isAdminGeneral = currentRol === 'admin';
  const isAdminEquipo = Array.isArray(equipo?.administradores)
    ? equipo.administradores.includes(currentUser?.uid)
    : false;
  const isAdmin = Boolean(isAdminGeneral || isAdminEquipo);

  const sizes = {
    sm: 'w-full max-w-xs h-40',
    md: 'w-full max-w-xs h-48 sm:h-60',
    lg: 'w-full max-w-sm h-56 sm:h-72'
  };

  const baseClasses = [
    'relative rounded-lg overflow-hidden shadow-xl cursor-pointer transition-all duration-300 ease-in-out bg-white flex flex-col justify-end',
    'hover:scale-105 hover:shadow-2xl dark:bg-gray-800 dark:border dark:border-gray-600 dark:shadow-gray-900/50',
    sizes[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} onClick={onClick}>
      {isAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onAdminClick) onAdminClick(equipo || { nombre, escudo });
          }}
          className="absolute top-2 right-2 z-30 px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Abrir panel de administración"
        >
          ⚙️ Admin
        </button>
      )}
      {tieneEscudo ? (
        <img
          src={escudo}
          alt={nombre}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center z-10">
          <span className="text-4xl sm:text-6xl text-white font-bold drop-shadow-lg">
            {nombre[0]}
          </span>
        </div>
      )}

      <div className="relative z-20 bg-black bg-opacity-60 dark:bg-black dark:bg-opacity-70 text-white p-2 sm:p-3 text-center rounded-b-lg backdrop-blur-sm">
        <h3 className="m-0 text-sm sm:text-lg font-bold drop-shadow-md line-clamp-2">
          {nombre}
        </h3>
      </div>
    </div>
  );
});

export default EquipoCard;
