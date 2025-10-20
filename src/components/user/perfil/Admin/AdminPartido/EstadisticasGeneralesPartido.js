import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, PieChart, Pie, LabelList
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function EstadisticasGeneralesPartido({ partidoId, tipoVista = 'agregadas', onRefresh }) {
  const { token } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    jugadores: [],
    equipos: []
  });
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('general'); // 'general', 'equipos' o 'jugadores'
  const [debugData, setDebugData] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [convirtiendo, setConvirtiendo] = useState(false);

  const convertirAManuales = async () => {
    if (!window.confirm('¿Estás seguro de convertir las estadísticas manuales a automáticas? Esta acción reemplazará los datos manuales con los calculados de los sets.')) {
      return;
    }

    setConvirtiendo(true);
    try {
      const response = await fetch(
        `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/convertir-a-automaticas/${partidoId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al convertir estadísticas');
      }

      const resultado = await response.json();
      alert(resultado.mensaje || 'Conversión completada');

      // Recargar estadísticas
      await cargarEstadisticas();

    } catch (error) {
      console.error('Error convirtiendo estadísticas:', error);
      alert('Error al convertir estadísticas: ' + error.message);
    } finally {
      setConvirtiendo(false);
    }
  };

  const cargarDebugData = async () => {
    try {
      const response = await fetch(
        `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/debug?partido=${partidoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setDebugData(data);
      setShowDebug(true);
    } catch (error) {
      console.error('Error cargando debug data:', error);
    }
  };

  // Función para cargar estadísticas - exportada para uso externo
  const cargarEstadisticas = useCallback(async () => {
    try {
      let data;

      if (tipoVista === 'directas') {
        // Cargar estadísticas directas (EstadisticasJugadorPartido)
        const [jugadoresResponse, equiposResponse] = await Promise.all([
          fetch(
            `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido?partido=${partidoId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `https://overtime-ddyl.onrender.com/api/estadisticas/equipo-partido?partido=${partidoId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);

        const estadisticasDirectas = await jugadoresResponse.json();
        const estadisticasEquipos = await equiposResponse.json();

        // Transformar estadísticas de jugadores
        const jugadoresFormateados = estadisticasDirectas.map(stat => ({
          _id: stat._id,
          throws: stat.throws || 0,
          hits: stat.hits || 0,
          outs: stat.outs || 0,
          catches: stat.catches || 0,
          jugadorPartido: stat.jugadorPartido,
          tipoCaptura: stat.tipoCaptura
        }));

        // Usar estadísticas de equipos reales de la base de datos
        const equiposFormateados = estadisticasEquipos.map(equipo => ({
          _id: equipo.equipo._id,
          nombre: equipo.equipo.nombre,
          escudo: equipo.equipo.escudo,
          throws: equipo.throws || 0,
          hits: equipo.hits || 0,
          outs: equipo.outs || 0,
          catches: equipo.catches || 0,
          jugadores: equipo.jugadores || 0,
          efectividad: equipo.throws > 0 ? ((equipo.hits / equipo.throws) * 100).toFixed(1) : 0
        }));

        data = {
          jugadores: jugadoresFormateados,
          equipos: equiposFormateados
        };
      } else {
        // Cargar estadísticas agregadas (desde sets)
        const response = await fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/resumen-partido/${partidoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = await response.json();
      }

      setEstadisticas(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [partidoId, token, tipoVista]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Exponer función de refresco si se proporciona callback
  useEffect(() => {
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh(cargarEstadisticas);
    }
  }, [onRefresh, cargarEstadisticas]);

  if (loading) return <div>Cargando estadísticas...</div>;

  const renderEstadisticasGenerales = () => {
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
  };

  const renderEstadisticasEquipos = () => (
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

  const renderEstadisticasJugadores = () => (
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
                        {jugador.jugadorPartido?.jugador?.nombre} {jugador.jugadorPartido?.jugador?.apellido}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {jugador.jugadorPartido?.equipo?.nombre}
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

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas del Partido</h2>
          <p className="text-sm text-gray-600 mt-1">
            {tipoVista === 'directas' 
              ? '📝 Mostrando estadísticas capturadas directamente' 
              : '📊 Mostrando estadísticas agregadas de sets'}
          </p>
          {/* Indicador de tipo de captura */}
          {estadisticas.jugadores?.length > 0 && (() => {
            const tiposCaptura = estadisticas.jugadores.map(j => j.tipoCaptura).filter(Boolean);
            const tiposUnicos = [...new Set(tiposCaptura)];
            
            if (tiposUnicos.length === 1) {
              const tipo = tiposUnicos[0];
              return (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  tipo === 'manual'
                    ? 'bg-blue-100 text-blue-800'
                    : tipo === 'mixta'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {tipo === 'manual' && '📝 Manual'}
                  {tipo === 'automatica' && '🤖 Automática'}
                  {tipo === 'mixta' && '🔄 Mixta'}
                </div>
              );
            } else if (tiposUnicos.length > 1) {
              return (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 bg-purple-100 text-purple-800">
                  🔀 Mixta ({tiposUnicos.length} tipos)
                </div>
              );
            }
            return null;
          })()}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setVista('general')}
            className={`px-4 py-2 rounded-md ${
              vista === 'general' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setVista('equipos')}
            className={`px-4 py-2 rounded-md ${
              vista === 'equipos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Equipos
          </button>
          <button
            onClick={() => setVista('jugadores')}
            className={`px-4 py-2 rounded-md ${
              vista === 'jugadores' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Jugadores
          </button>
          {estadisticas.jugadores?.some(j => j.tipoCaptura === 'manual') && (
            <button
              onClick={convertirAManuales}
              disabled={convirtiendo}
              className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Convertir estadísticas manuales a automáticas usando datos de sets"
            >
              {convirtiendo ? 'Convirtiendo...' : '🔄 A Automáticas'}
            </button>
          )}
          <button
            onClick={cargarDebugData}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            🔧 Debug
          </button>
        </div>
      </div>

      {showDebug && debugData ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-red-800">🔧 Debug Data</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Cerrar
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-700">📊 Estadísticas por Set:</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugData.estadisticasJugadorSet, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-700">👤 Estadísticas por Jugador (Partido):</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugData.estadisticasJugadorPartido, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-700">🏟️ Estadísticas por Equipo:</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugData.estadisticasEquipoPartido, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-700">👥 Jugadores del Partido:</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugData.jugadorPartido, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : vista === 'general' 
        ? renderEstadisticasGenerales() 
        : vista === 'equipos' 
          ? renderEstadisticasEquipos() 
          : renderEstadisticasJugadores()}
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