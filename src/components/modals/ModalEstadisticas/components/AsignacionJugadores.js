import React from 'react';

export default function AsignacionJugadores({
  partido,
  jugadoresLocal,
  jugadoresVisitante,
  loadingLocal,
  loadingVisitante,
  jugadoresSeleccionadosLocal,
  jugadoresSeleccionadosVisitante,
  toggleJugadorLocal,
  toggleJugadorVisitante,
  asignarJugadores,
  asignandoJugadores,
  hayJugadoresAsignados,
  onClose
}) {
  return (
    <div className="space-y-6">
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
            <div>
              <h3 className="text-lg font-bold text-blue-800">
                {partido?.equipoLocal?.nombre || 'Equipo Local'}
              </h3>
              <p className="text-xs text-blue-600">
                {jugadoresSeleccionadosLocal.size} de {jugadoresLocal.length} jugadores seleccionados
              </p>
            </div>
          </div>

          {loadingLocal ? (
            <p className="text-gray-600 text-sm">Cargando jugadores...</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {jugadoresLocal.map(jugador => (
                <label key={jugador.jugador._id} className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jugadoresSeleccionadosLocal.has(jugador.jugador._id)}
                    onChange={() => toggleJugadorLocal(jugador.jugador._id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">
                    {jugador.jugador.numero ? `#${jugador.jugador.numero} ` : ''}
                    {jugador.jugador.nombre}
                  </span>
                </label>
              ))}
            </div>
          )}
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
            <div>
              <h3 className="text-lg font-bold text-red-800">
                {partido?.equipoVisitante?.nombre || 'Equipo Visitante'}
              </h3>
              <p className="text-xs text-red-600">
                {jugadoresSeleccionadosVisitante.size} de {jugadoresVisitante.length} jugadores seleccionados
              </p>
            </div>
          </div>

          {loadingVisitante ? (
            <p className="text-gray-600 text-sm">Cargando jugadores...</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {jugadoresVisitante.map(jugador => (
                <label key={jugador.jugador._id} className="flex items-center gap-3 p-2 hover:bg-red-100 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jugadoresSeleccionadosVisitante.has(jugador.jugador._id)}
                    onChange={() => toggleJugadorVisitante(jugador.jugador._id)}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm">
                    {jugador.jugador.numero ? `#${jugador.jugador.numero} ` : ''}
                    {jugador.jugador.nombre}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={asignarJugadores}
          disabled={asignandoJugadores}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {asignandoJugadores
            ? 'Actualizando...'
            : (hayJugadoresAsignados ? 'Actualizar Asignación' : 'Asignar Jugadores')
          }
        </button>
      </div>
    </div>
  );
}
