import React from "react";

const TarjetaPartido = React.memo(function TarjetaPartido({ partido, onClick, onAdminClick, user, rol }) {
  if (!partido) return null;

  const equipoLocal = partido.equipoLocal;
  const equipoVisitante = partido.equipoVisitante;

  const nombreLocal = equipoLocal?.nombre || "Equipo Local";
  const nombreVisitante = equipoVisitante?.nombre || "Equipo Visitante";

  const escudoLocal = equipoLocal?.escudo || "https://via.placeholder.com/40x40?text=EL";
  const escudoVisitante = equipoVisitante?.escudo || "https://via.placeholder.com/40x40?text=EV";

  const marcadorLocal = partido.marcadorLocal ?? "-";
  const marcadorVisitante = partido.marcadorVisitante ?? "-";

  // Check if current user is admin of this match
  const isAdmin = user && (
    partido.creadoPor === user.uid ||
    (partido.administradores && partido.administradores.includes(user.uid)) ||
    rol === 'admin'
  );

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-3 sm:p-4 w-full max-w-xs sm:w-52 text-center cursor-pointer
                 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl
                 flex flex-col justify-between items-center dark:bg-gray-800 dark:border dark:border-gray-600"
      onClick={onClick}
    >
      {/* Escudos */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full mb-1">
        <img src={escudoLocal} alt={nombreLocal} className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
        <span className="font-bold text-base sm:text-lg text-gray-700 dark:text-gray-300">vs</span>
        <img src={escudoVisitante} alt={nombreVisitante} className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
      </div>

      {/* Marcador */}
      <div className="flex justify-center items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
        <span className="text-sm sm:text-base font-bold">{marcadorLocal}</span>
        <span className="text-xs sm:text-sm text-gray-500">-</span>
        <span className="text-sm sm:text-base font-bold">{marcadorVisitante}</span>
      </div>

      {/* Nombres + Info */}
      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 leading-tight px-1">
        <span className="hidden sm:inline">{nombreLocal} vs {nombreVisitante}</span>
        <span className="sm:hidden">
          {nombreLocal.split(' ')[0]} vs {nombreVisitante.split(' ')[0]}
        </span>
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 capitalize">
        <span className="hidden sm:block">
          {partido.modalidad} · {partido.categoria}
        </span>
        <span className="sm:hidden">
          {partido.modalidad}
        </span>
        <br className="sm:hidden" />
        <span className="block sm:inline">
          {new Date(partido.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: window.innerWidth < 640 ? '2-digit' : 'numeric'
          })}
        </span>
      </p>
      
      {/* Botones */}
      <div className="flex gap-2 mt-auto">
        {isAdmin && (
          <button
            className="px-3 py-2 bg-red-600 text-white font-medium rounded-lg text-sm
                       hover:bg-red-700 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-white"
            onClick={(e) => { 
              e.stopPropagation(); 
              if (onAdminClick) onAdminClick(partido);
            }}
            title="Administrar partido"
          >
            ⚙️ Admin
          </button>
        )}
        <button
          className="px-3 py-2 bg-slate-700 text-white font-medium rounded-lg text-sm
                     hover:bg-slate-800 transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          Ver más
        </button>
      </div>
    </div>
  );
});

export default TarjetaPartido;
