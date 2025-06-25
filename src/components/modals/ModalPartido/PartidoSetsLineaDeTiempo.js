import React, { useState } from 'react';

export default function PartidoSetsLineaDeTiempo({ sets = [], equipoLocal, equipoVisitante, jugadores = [] }) {
  const [setSeleccionado, setSetSeleccionado] = useState(null);

  // Helper function to determine background color based on set winner
  const getSetBackgroundColor = (set) => {
    const winner = set.ganadorSet;
    switch (winner) {
      case 'local':
        return 'bg-green-200 hover:bg-green-300'; // Light green for local winner
      case 'visitante':
        return 'bg-red-200 hover:bg-red-300';   // Light red for visitor winner
      case 'empate':
        return 'bg-blue-200 hover:bg-blue-300';    // Light blue for draw
      case 'pendiente':
        return 'bg-gray-200 hover:bg-gray-300';   // Light gray for pending
      default:
        return 'bg-gray-300 hover:bg-gray-400';   // Default gray for unexpected
    }
  };

  const obtenerNombreJugador = (id) => {
    const jugador = jugadores.find(j => j._id === id);
    return jugador ? jugador.alias || jugador.nombre : `ID: ${id.substring(0, 6)}...`;
  };

  const obtenerNombreEquipo = (ganador) => {
    if (ganador === 'local') return equipoLocal?.nombre || 'Equipo Local';
    if (ganador === 'visitante') return equipoVisitante?.nombre || 'Equipo Visitante';
    if (ganador === 'empate') return 'Empate';
    if (ganador === 'pendiente') return 'Pendiente';
    return `Equipo ${ganador}`;
  };

  const agruparPorEquipo = (stats) => {
    const grupos = {
      [equipoLocal?._id]: [],
      [equipoVisitante?._id]: [],
    };
    for (const stat of stats || []) {
      const equipoId = stat.equipo?._id || stat.equipo;
      if (!grupos[equipoId]) grupos[equipoId] = []; // Initialize if team ID is unexpected
      grupos[equipoId].push(stat);
    }
    return grupos;
  };

  return (
    <section className="mb-8 w-full"> {/* wrapper */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Línea de tiempo de Sets</h3>

      {sets.length === 0 ? (
        <p className="text-gray-500 text-center py-4 bg-gray-100 rounded-md">No hay sets cargados para este partido.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-2 mb-4"> {/* timeline */}
          {sets.map((set) => (
            <div
              key={set.numeroSet}
              onClick={() => setSetSeleccionado(set)}
              className={`
                flex-shrink-0 flex-grow-0 basis-16 sm:basis-20 md:basis-24 lg:basis-28 xl:basis-32
                p-2 rounded-lg text-center shadow-sm text-sm font-semibold cursor-pointer
                transition-all duration-200 ease-in-out
                ${getSetBackgroundColor(set)}
                ${setSeleccionado?.numeroSet === set.numeroSet ? 'border-2 border-slate-700 shadow-md transform scale-105' : 'border-2 border-transparent'}
              `}
            >
              Set {set.numeroSet}
            </div>
          ))}
        </div>
      )}

      {setSeleccionado && (
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200"> {/* detallesBox */}
          <h4 className="text-lg font-bold text-gray-700 mb-2">Set {setSeleccionado.numeroSet} Detalles</h4>
          <p className="text-gray-700 mb-1">
            <strong className="font-semibold">Estado:</strong> {setSeleccionado.estadoSet || 'No definido'}
          </p>
          <p className="text-gray-700 mb-4">
            <strong className="font-semibold">Ganador:</strong>{' '}
            {setSeleccionado.ganadorSet ? obtenerNombreEquipo(setSeleccionado.ganadorSet) : 'Pendiente'}
          </p>

          <div className="flex flex-wrap lg:flex-nowrap gap-4 mt-4 justify-center"> {/* estadisticasContainer */}
            {[equipoLocal, equipoVisitante].map((equipo) => {
              const stats = agruparPorEquipo(setSeleccionado.statsJugadoresSet)[equipo?._id] || [];
              return (
                <div key={equipo?._id} className="flex-1 min-w-[280px] max-w-full bg-white p-3 rounded-md shadow-sm border border-gray-100"> {/* equipoBox */}
                  <h5 className="text-md font-bold text-gray-800 mb-3 text-center">{equipo?.nombre || 'Equipo Desconocido'}</h5>
                  <div className="overflow-x-auto"> {/* Added for horizontal scrolling on small screens */}
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="py-2 px-2">Jugador</th>
                          <th scope="col" className="py-2 px-2">Throws</th>
                          <th scope="col" className="py-2 px-2">Hits</th>
                          <th scope="col" className="py-2 px-2">Outs</th>
                          <th scope="col" className="py-2 px-2">Catches</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.length > 0 ? (
                          stats.map((stat, idx) => (
                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                              <td className="py-2 px-2 font-medium text-gray-900 whitespace-nowrap">
                                {typeof stat.jugador === 'object' && stat.jugador
                                  ? stat.jugador.alias || stat.jugador.nombre
                                  : obtenerNombreJugador(stat.jugador)}
                              </td>
                              <td className="py-2 px-2">{stat.estadisticas?.throws ?? 0}</td>
                              <td className="py-2 px-2">{stat.estadisticas?.hits ?? 0}</td>
                              <td className="py-2 px-2">{stat.estadisticas?.outs ?? 0}</td>
                              <td className="py-2 px-2">{stat.estadisticas?.catches ?? 0}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="bg-white">
                            <td colSpan={5} className="py-4 px-2 text-center italic text-gray-400">Sin estadísticas</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}