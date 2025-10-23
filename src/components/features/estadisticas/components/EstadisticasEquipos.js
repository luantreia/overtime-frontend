import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

export function renderEstadisticasEquipos(estadisticas, partido) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Estadísticas por Equipo</h3>

      {/* Usar los datos de equipos que vienen del backend */}
      {(() => {
        const equiposData = estadisticas.equipos || [];

        return equiposData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {equiposData.map((equipo, index) => (
                <div key={equipo._id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center gap-3 mb-4">
                    {equipo.escudo && (
                      <img
                        src={equipo.escudo}
                        alt={`Escudo ${equipo.nombre}`}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <h4 className="text-lg font-bold">{equipo.nombre}</h4>
                    <span className="text-sm text-gray-500 ml-auto">
                      {equipo.jugadores || 0} jugador{equipo.jugadores !== 1 ? 'es' : ''}
                    </span>
                    {/* Indicador de fuente de datos */}
                    {estadisticas.jugadores?.length > 0 && (() => {
                      const fuentesUnicas = [...new Set(estadisticas.jugadores.map(j => j.fuente).filter(Boolean))];

                      if (fuentesUnicas.length === 1) {
                        const fuente = fuentesUnicas[0];
                        return (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            fuente.includes('manual') ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {fuente.includes('manual') ? '✏️ Manual' : '🤖 Automática'}
                          </div>
                        );
                      } else if (fuentesUnicas.length > 1) {
                        return (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 bg-purple-100 text-purple-800">
                            🔄 Combinadas ({fuentesUnicas.length} fuentes)
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      title="Lanzamientos"
                      value={equipo.throws}
                      color="bg-blue-100 text-blue-800"
                    />
                    <StatCard
                      title="Golpes"
                      value={equipo.hits}
                      color="bg-green-100 text-green-800"
                    />
                    <StatCard
                      title="Outs"
                      value={equipo.outs}
                      color="bg-red-100 text-red-800"
                    />
                    <StatCard
                      title="Atrapadas"
                      value={equipo.catches}
                      color="bg-yellow-100 text-yellow-800"
                    />
                    <div className="col-span-2">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-sm text-gray-600">Efectividad</div>
                        <div className="text-xl font-bold">{equipo.efectividad}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-lg font-semibold mb-4">Comparativa de Equipos</h4>
            <div className="bg-white p-4 rounded-lg shadow mb-8">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={equiposData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="throws" name="Lanzamientos" fill="#3b82f6" />
                  <Bar dataKey="hits" name="Golpes" fill="#10b981" />
                  <Bar dataKey="outs" name="Outs" fill="#ef4444" />
                  <Bar dataKey="catches" name="Atrapadas" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="text-gray-600">No hay estadísticas de equipos disponibles aún</p>
        );
      })()}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`p-3 rounded-lg ${color}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
