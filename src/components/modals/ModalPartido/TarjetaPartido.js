// src/components/modals/ModalPartido/tarjetapartido.js

import React from "react";

export default function TarjetaPartido({ partido, onClick }) {
  if (!partido) {
    return null; // Or some fallback UI
  }

  const equipoLocal = partido.equipoLocal;
  const equipoVisitante = partido.equipoVisitante;

  const nombreLocal = equipoLocal?.nombre || "Equipo Local";
  const nombreVisitante = equipoVisitante?.nombre || "Equipo Visitante";

  // Use a placeholder if no actual escudo URL is provided
  const escudoLocal = equipoLocal?.escudo || "https://via.placeholder.com/40x40?text=EL"; // Example placeholder
  const escudoVisitante = equipoVisitante?.escudo || "https://via.placeholder.com/40x40?text=EV"; // Example placeholder

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-4 w-52 text-center cursor-pointer
                 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl
                 flex flex-col justify-between items-center" // Added flex for internal layout
      onClick={onClick}
    >
      <div className="flex items-center justify-center gap-3 w-full mb-3"> {/* escudos flex container */}
        <img
          src={escudoLocal}
          alt={nombreLocal}
          className="w-10 h-10 object-contain flex-shrink-0" // Adjusted size, added flex-shrink-0
        />
        <span className="font-bold text-lg text-gray-700">vs</span> {/* vs text */}
        <img
          src={escudoVisitante}
          alt={nombreVisitante}
          className="w-10 h-10 object-contain flex-shrink-0" // Adjusted size, added flex-shrink-0
        />
      </div>

      <h3 className="text-base font-semibold text-gray-800 mb-1 leading-tight">{nombreLocal} vs {nombreVisitante}</h3> {/* nombre */}
      {partido.liga && <p className="text-sm text-gray-600 mb-1">{partido.liga}</p>} {/* liga */}
      <p className="text-xs text-gray-500 mb-3">{new Date(partido.fecha).toLocaleDateString()}</p> {/* fecha */}

      <button
        className="mt-2 px-4 py-2 bg-slate-700 text-white font-medium rounded-lg
                   hover:bg-slate-800 transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-white" // Professional button styling
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        Ver más
      </button>
    </div>
  );
}