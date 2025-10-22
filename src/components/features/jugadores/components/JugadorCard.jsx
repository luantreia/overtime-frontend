// src/components/features/jugadores/components/JugadorCard.jsx
import React from 'react';
import { Card } from '../../../ui';
import { normalizeEquipoNombre } from '../../../../utils/partidoUtils';

/**
 * Componente JugadorCard para mostrar información de jugador en tarjetas
 */
const JugadorCard = ({
  jugador,
  onClick,
  showStats = true,
  compact = false,
  className = ''
}) => {
  const { nombre, apellido, equipo, estadisticas, foto } = jugador;

  const nombreCompleto = `${nombre || ''} ${apellido || ''}`.trim() || 'Jugador sin nombre';
  const equipoNombre = equipo ? normalizeEquipoNombre(equipo, equipo?.nombre, 'Sin equipo') : null;
  const escudo = equipo?.escudo;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg overflow-hidden p-0 ${className}`}
      onClick={onClick}
    >
      <div className={`relative w-full ${compact ? 'h-40' : 'h-56'} bg-gray-200 dark:bg-gray-700`}>
        {/* Fondo: foto a full o placeholder */}
        {foto ? (
          <img
            src={foto}
            alt={nombreCompleto}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center select-none">
            <span className={`${compact ? 'text-5xl' : 'text-7xl'} font-bold text-gray-400 dark:text-gray-500`}>
              {nombreCompleto[0] || '?'}
            </span>
          </div>
        )}

        {/* Escudo del equipo en esquina */}
        {escudo && (
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full overflow-hidden border border-white shadow">
            <img src={escudo} alt={equipoNombre || 'Equipo'} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Footer con nombre (overlay) */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="px-3 py-2 bg-gradient-to-t from-black/70 to-black/10">
            <h3 className={`truncate text-white font-semibold ${compact ? 'text-sm' : 'text-base'}`}>{nombreCompleto}</h3>
            {equipoNombre && (
              <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-gray-200 truncate`}>{equipoNombre}</p>
            )}
          </div>
        </div>
      </div>

      {/* Métricas al pie (opcional) */}
      {showStats && estadisticas && (
        <div className={`flex items-center justify-between px-3 ${compact ? 'py-1.5' : 'py-2'}`}>
          <span className="text-blue-600 dark:text-blue-400 text-xs">
            {estadisticas.totalPartidos || 0} partidos
          </span>
          <span className="text-green-600 dark:text-green-400 text-xs">
            {estadisticas.partidosGanados || 0} victorias
          </span>
        </div>
      )}
    </Card>
  );
};

export default JugadorCard;
