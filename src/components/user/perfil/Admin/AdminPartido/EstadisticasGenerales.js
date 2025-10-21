import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function renderEstadisticasGenerales(estadisticas, partido) {
  // Calcular totales del partido desde estadísticas individuales de jugadores
  const totales = estadisticas.jugadores?.reduce((acc, jugador) => ({
    throws: acc.throws + (jugador.throws || 0),
    hits: acc.hits + (jugador.hits || 0),
    outs: acc.outs + (jugador.outs || 0),
    catches: acc.catches + (jugador.catches || 0),
  }), { throws: 0, hits: 0, outs: 0, catches: 0 }) || { throws: 0, hits: 0, outs: 0, catches: 0 };

  const efectividadGeneral = totales.throws > 0
    ? ((totales.hits / totales.throws) * 100).toFixed(1)
    : 0;

  // Usar las estadísticas de equipos calculadas desde el backend
  const equiposData = estadisticas.equipos || [];

  // Datos para el gráfico de torta (distribución por equipo)
  const pieData = equiposData.map((equipo, index) => ({
    name: equipo.nombre,
    value: equipo.throws || 0,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-center">Resumen General del Partido</h3>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Lanzamientos"
          value={totales.throws}
          color="bg-blue-100 text-blue-800"
        />
        <StatCard
          title="Total Golpes"
          value={totales.hits}
          color="bg-green-100 text-green-800"
        />
        <StatCard
          title="Total Outs"
          value={totales.outs}
          color="bg-red-100 text-red-800"
        />
        <StatCard
          title="Total Atrapadas"
          value={totales.catches}
          color="bg-yellow-100 text-yellow-800"
        />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{efectividadGeneral}%</div>
          <div className="text-sm text-gray-600">Efectividad General</div>
          <div className="text-xs text-gray-500 mt-1">(Golpes/Lanzamientos)</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-2">{equiposData.length}</div>
          <div className="text-sm text-gray-600">Equipos Participantes</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{estadisticas.jugadores?.length || 0}</div>
          <div className="text-sm text-gray-600">Jugadores Totales</div>
        </div>
      </div>

      {/* Gráfico de distribución por equipo */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4 text-center">Distribución de Lanzamientos por Equipo</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Comparativa rápida de equipos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-4">Comparativa Rápida por Equipo</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lanzamientos</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Golpes</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Efectividad</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jugadores</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equiposData.map((equipo) => (
                <tr key={equipo._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {equipo.escudo && (
                        <img
                          src={equipo.escudo}
                          alt={`Escudo ${equipo.nombre}`}
                          className="w-8 h-8 object-contain mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{equipo.nombre}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {equipo.throws}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {equipo.hits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${equipo.efectividad > 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {equipo.efectividad}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {equipo.jugadores}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
