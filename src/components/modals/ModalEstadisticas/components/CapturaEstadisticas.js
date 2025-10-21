import React from 'react';
import EstadisticasJugador from './EstadisticasJugador';

export default function CapturaEstadisticas({
  partido,
  seleccionesLocal,
  seleccionesVisitante,
  estadisticas,
  getJugadoresPorEquipo,
  cambiarSeleccionJugador,
  cambiarEstadistica,
  setMostrarAsignacion,
  guardar,
  guardando,
  hayDatosAutomaticos
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <button
          onClick={() => setMostrarAsignacion(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          ✏️ Editar Jugadores
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipo Local */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            {partido?.equipoLocal?.escudo && (
              <img
                src={partido.equipoLocal.escudo}
                alt={`Escudo ${partido.equipoLocal.nombre}`}
                className="w-8 h-8 object-contain"
              />
            )}
            <h3 className="text-lg font-bold text-blue-800">
              {partido?.equipoLocal?.nombre || 'Equipo Local'}
            </h3>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 10 }, (_, index) => {
              const posicion = index + 1;
              const jugadorSeleccionadoId = seleccionesLocal[index];
              const jugadoresEquipo = getJugadoresPorEquipo(partido?.equipoLocal?._id);

              return (
                <div key={`local-${index}`} className="bg-white p-3 rounded border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-600 w-8">
                      #{posicion}
                    </span>
                    <select
                      value={jugadorSeleccionadoId || ''}
                      onChange={(e) => cambiarSeleccionJugador('local', index, e.target.value)}
                      className={`flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        hayDatosAutomaticos && jugadorSeleccionadoId ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                    >
                      <option value="">
                        {hayDatosAutomaticos && !jugadorSeleccionadoId ? 'Posición libre' : 'Seleccionar jugador'}
                      </option>
                      {jugadoresEquipo.length > 0 ? (
                        jugadoresEquipo.map(jugador => {
                          const nombre = jugador.jugador?.nombre || 'Sin nombre';
                          const numero = jugador.jugador?.numero || jugador.numero || '';
                          const displayText = numero ? `#${numero} ${nombre}` : nombre;

                          return (
                            <option key={jugador._id} value={jugador._id}>
                              {displayText}
                            </option>
                          );
                        })
                      ) : (
                        <option disabled>No hay jugadores disponibles</option>
                      )}
                    </select>
                  </div>

                  {jugadorSeleccionadoId && (
                    <EstadisticasJugador
                      jugadorPartidoId={jugadorSeleccionadoId}
                      estadisticas={estadisticas[jugadorSeleccionadoId] || {}}
                      onCambiarEstadistica={cambiarEstadistica}
                      hayDatosAutomaticos={hayDatosAutomaticos}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipo Visitante */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            {partido?.equipoVisitante?.escudo && (
              <img
                src={partido.equipoVisitante.escudo}
                alt={`Escudo ${partido.equipoVisitante.nombre}`}
                className="w-8 h-8 object-contain"
              />
            )}
            <h3 className="text-lg font-bold text-red-800">
              {partido?.equipoVisitante?.nombre || 'Equipo Visitante'}
            </h3>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 10 }, (_, index) => {
              const posicion = index + 1;
              const jugadorSeleccionadoId = seleccionesVisitante[index];
              const jugadoresEquipo = getJugadoresPorEquipo(partido?.equipoVisitante?._id);

              return (
                <div key={`visitante-${index}`} className="bg-white p-3 rounded border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-600 w-8">
                      #{posicion}
                    </span>
                    <select
                      value={jugadorSeleccionadoId || ''}
                      onChange={(e) => cambiarSeleccionJugador('visitante', index, e.target.value)}
                      className={`flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 ${
                        hayDatosAutomaticos && jugadorSeleccionadoId ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                    >
                      <option value="">
                        {hayDatosAutomaticos && !jugadorSeleccionadoId ? 'Posición libre' : 'Seleccionar jugador'}
                      </option>
                      {jugadoresEquipo.length > 0 ? (
                        jugadoresEquipo.map(jugador => {
                          const nombre = jugador.jugador?.nombre || 'Sin nombre';
                          const numero = jugador.jugador?.numero || jugador.numero || '';
                          const displayText = numero ? `#${numero} ${nombre}` : nombre;

                          return (
                            <option key={jugador._id} value={jugador._id}>
                              {displayText}
                            </option>
                          );
                        })
                      ) : (
                        <option disabled>No hay jugadores disponibles</option>
                      )}
                    </select>
                  </div>

                  {jugadorSeleccionadoId && (
                    <EstadisticasJugador
                      jugadorPartidoId={jugadorSeleccionadoId}
                      estadisticas={estadisticas[jugadorSeleccionadoId] || {}}
                      onCambiarEstadistica={cambiarEstadistica}
                      hayDatosAutomaticos={hayDatosAutomaticos}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          onClick={() => {}}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          disabled={guardando}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guardando ? 'Guardando...' : 'Guardar Estadísticas'}
        </button>
      </div>
    </>
  );
}
