import React from "react";

export default function TarjetaPartido({ partido, onClick }) {
  if (!partido) return null;

  const equipoLocal = partido.equipoLocal;
  const equipoVisitante = partido.equipoVisitante;

  const nombreLocal = equipoLocal?.nombre || "Equipo Local";
  const nombreVisitante = equipoVisitante?.nombre || "Equipo Visitante";

  const escudoLocal = equipoLocal?.escudo || "https://via.placeholder.com/40x40?text=EL";
  const escudoVisitante = equipoVisitante?.escudo || "https://via.placeholder.com/40x40?text=EV";

  const marcadorLocal = partido.marcadorLocal ?? "-";
  const marcadorVisitante = partido.marcadorVisitante ?? "-";

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-4 w-52 text-center cursor-pointer
                 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl
                 flex flex-col justify-between items-center"
      onClick={onClick}
    >
      {/* Escudos */}
      <div className="flex items-center justify-center gap-3 w-full mb-1">
        <img src={escudoLocal} alt={nombreLocal} className="w-10 h-10 object-contain flex-shrink-0" />
        <span className="font-bold text-lg text-gray-700">vs</span>
        <img src={escudoVisitante} alt={nombreVisitante} className="w-10 h-10 object-contain flex-shrink-0" />
      </div>

      {/* Marcador */}
      <div className="flex justify-center items-center gap-2 mb-2 text-gray-800">
        <span className="text-base font-bold">{marcadorLocal}</span>
        <span className="text-sm text-gray-500">-</span>
        <span className="text-base font-bold">{marcadorVisitante}</span>
      </div>

      {/* Nombres + Info */}
      <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">{nombreLocal} vs {nombreVisitante}</h3>
      <p className="text-xs text-gray-500 mb-3 capitalize">
        {partido.modalidad} · {partido.categoria} · {new Date(partido.fecha).toLocaleDateString()}
      </p>
      {/* Botón */}
      <button
        className="mt-auto px-4 py-2 bg-slate-700 text-white font-medium rounded-lg
                   hover:bg-slate-800 transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        Ver más
      </button>
    </div>
  );
}
