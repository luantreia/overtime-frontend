import React from 'react';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';

export default function SeccionEquiposJugador({ jugadorId }) {
  const { relaciones, loading } = useJugadorEquipo({ jugadorId });

  return (
    <section className="bg-gray-100 rounded-xl p-4 mt-2.5 shadow-sm"> {/* Refactorizado de styles.seccion */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Equipo/s</h3> {/* Título de sección */}
      {loading ? (
        <p className="text-gray-600">Cargando equipos...</p>
      ) : relaciones.length === 0 ? (
        <p className="text-gray-600">No se encontro ningún equipo</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1"> {/* Añadido estilo de lista básica */}
          {relaciones.map((rel) => (
            <li key={rel._id} className="text-gray-700"> {/* Usamos <li> para elementos de lista */}
              <span className="font-medium">{rel.equipo?.nombre || 'Equipo sin nombre'}</span>
              {rel.posicion && <span className="font-bold"> – {rel.posicion}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}