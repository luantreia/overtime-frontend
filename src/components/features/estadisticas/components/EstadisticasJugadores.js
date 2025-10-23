export function renderEstadisticasJugadores(estadisticas, partido) {
  console.log('🎾 renderEstadisticasJugadores recibió:', {
    jugadoresLength: estadisticas.jugadores?.length || 0,
    tieneJugadores: !!estadisticas.jugadores,
    primerJugador: estadisticas.jugadores?.[0] || 'Sin jugadores'
  });

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Estadísticas por Jugador</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jugador</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Equipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lanz.</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Golpes</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Outs</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Atrap.</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Efect.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {estadisticas.jugadores?.length > 0 ? estadisticas.jugadores?.map((jugador) => {
              const efectividad = jugador.throws > 0
                ? ((jugador.hits / jugador.throws) * 100).toFixed(1)
                : 0;

              return (
                <tr key={jugador._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {jugador.jugadorPartido?.jugador?.nombre || 'Sin nombre'} {jugador.jugadorPartido?.jugador?.apellido || ''}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {jugador.jugadorPartido?.equipo?.nombre || 'Sin equipo'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {jugador.throws}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {jugador.hits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {jugador.outs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {jugador.catches}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${efectividad > 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {efectividad}%
                    </span>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No hay estadísticas de jugadores disponibles aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
