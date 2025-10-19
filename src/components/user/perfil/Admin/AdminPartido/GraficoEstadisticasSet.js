import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Colores de fondo por equipo (constante fuera del componente)
const COLORES_EQUIPO = ['#dbeafe', '#fce7f3', '#fef3c7', '#dcfce7', '#f3e8ff'];

export default function GraficoEstadisticasSet({ setId, token }) {
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla' o 'grafico'
  const [escalaLogaritmica, setEscalaLogaritmica] = useState(false);
  const [ordenPor, setOrdenPor] = useState('equipo'); // 'equipo', 'throws', 'hits', 'outs', 'catches'
  const [ordenDireccion, setOrdenDireccion] = useState('desc'); // 'asc' o 'desc'

  useEffect(() => {
    if (!setId || !token) return;
    
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set?set=${setId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!response.ok) {
          throw new Error('Error al cargar estadísticas');
        }

        const data = await response.json();
        setEstadisticas(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, [setId, token]);

  // HOOKS: Preparar datos para el gráfico ANTES de cualquier return
  // Agrupar por equipos
  const equiposData = useMemo(() => {
    const data = {};
    estadisticas.forEach(stat => {
      const equipoId = stat.equipo._id || stat.equipo;
      const equipoNombre = stat.equipo.nombre || 'Equipo';
      
      if (!data[equipoId]) {
        data[equipoId] = {
          nombre: equipoNombre,
          totales: { throws: 0, hits: 0, outs: 0, catches: 0 },
          jugadores: []
        };
      }
      
      data[equipoId].totales.throws += stat.throws || 0;
      data[equipoId].totales.hits += stat.hits || 0;
      data[equipoId].totales.outs += stat.outs || 0;
      data[equipoId].totales.catches += stat.catches || 0;
      data[equipoId].jugadores.push(stat);
    });
    return data;
  }, [estadisticas]);

  // Preparar datos para el gráfico con ordenamiento
  const datosGrafico = useMemo(() => {
    const datos = [];
    const equiposUnicos = {};
    let colorIndex = 0;
    
    // Primero identificar equipos y asignar colores
    estadisticas.forEach(stat => {
      const equipoId = stat.equipo._id || stat.equipo;
      if (!equiposUnicos[equipoId]) {
        equiposUnicos[equipoId] = {
          nombre: stat.equipo.nombre || 'Equipo',
          color: COLORES_EQUIPO[colorIndex % COLORES_EQUIPO.length],
          index: colorIndex
        };
        colorIndex++;
      }
    });
    
    // Luego crear datos con información de equipo
    estadisticas.forEach((stat, index) => {
      let jugadorNombre = 'Jugador';
      
      if (stat.jugador) {
        if (stat.jugador.nombre && stat.jugador.apellido) {
          // Caso 1: Tiene nombre Y apellido separados
          jugadorNombre = `${stat.jugador.nombre.charAt(0)}. ${stat.jugador.apellido}`;
        } else if (stat.jugador.nombre) {
          // Caso 2: Solo tiene nombre completo en un campo
          const partes = stat.jugador.nombre.trim().split(' ');
          if (partes.length > 1) {
            // Si el nombre tiene espacios, usar primera inicial + última parte
            jugadorNombre = `${partes[0].charAt(0)}. ${partes[partes.length - 1]}`;
          } else {
            // Si es solo una palabra, usar completo
            jugadorNombre = stat.jugador.nombre;
          }
        }
      }
      
      
      const equipoId = stat.equipo._id || stat.equipo;
      
      // Para escala logarítmica: convertir 0 a 0.1 (mínimo visible)
      const ajustarParaLog = (valor) => {
        if (escalaLogaritmica) {
          return valor === 0 ? 0.1 : valor;
        }
        return valor;
      };
      
      datos.push({
        nombre: jugadorNombre,
        equipo: stat.equipo.nombre || 'Equipo',
        equipoId: equipoId,
        equipoIndex: equiposUnicos[equipoId].index,
        colorFondo: equiposUnicos[equipoId].color,
        Lanzamientos: ajustarParaLog(stat.throws || 0),
        Golpes: ajustarParaLog(stat.hits || 0),
        Outs: ajustarParaLog(stat.outs || 0),
        Atrapadas: ajustarParaLog(stat.catches || 0),
        // Guardar valores reales para el tooltip y ordenamiento
        lanzamientosReal: stat.throws || 0,
        golpesReal: stat.hits || 0,
        outsReal: stat.outs || 0,
        atrapadasReal: stat.catches || 0
      });
    });
    
    // Aplicar ordenamiento
    if (ordenPor === 'equipo') {
      // Ordenar por equipo (agrupación por defecto)
      datos.sort((a, b) => {
        const equipoCompare = a.equipoIndex - b.equipoIndex;
        if (equipoCompare !== 0) return equipoCompare;
        // Dentro del mismo equipo, ordenar por lanzamientos (mayor a menor)
        return b.lanzamientosReal - a.lanzamientosReal;
      });
    } else {
      // Ordenar por estadística específica
      const mapaCampo = {
        'throws': 'lanzamientosReal',
        'hits': 'golpesReal',
        'outs': 'outsReal',
        'catches': 'atrapadasReal'
      };
      const campo = mapaCampo[ordenPor];
      
      datos.sort((a, b) => {
        const diff = b[campo] - a[campo];
        if (ordenDireccion === 'desc') {
          return diff; // Mayor a menor
        } else {
          return -diff; // Menor a mayor
        }
      });
    }
    
    return datos;
  }, [estadisticas, escalaLogaritmica, ordenPor, ordenDireccion]);
  
  // Returns tempranos DESPUÉS de los hooks
  if (loading) {
    return (
      <div className="text-center py-4 text-gray-600">
        <span className="text-sm">Cargando estadísticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <span className="text-sm">Error: {error}</span>
      </div>
    );
  }

  if (estadisticas.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <span className="text-sm">No hay estadísticas capturadas para este set</span>
      </div>
    );
  }
  
  // Custom tooltip con información del equipo
  const CustomTooltip = ({ active, payload, label, coordinate }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }
    
    // Obtener datos del jugador desde el payload
    // En gráfico de barras agrupadas, payload[0].payload contiene todos los datos del punto
    const jugadorData = payload[0].payload;
    
    if (!jugadorData) {
      return null;
    }
    
    
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg z-50">
        <p className="font-semibold text-gray-900">{label || jugadorData.nombre}</p>
        <p className="text-xs text-gray-600 mb-2">Equipo: {jugadorData.equipo}</p>
        <div className="space-y-1">
          <p style={{ color: '#3b82f6' }} className="text-sm">
            Lanzamientos: <span className="font-semibold">{jugadorData.lanzamientosReal ?? 0}</span>
          </p>
          <p style={{ color: '#10b981' }} className="text-sm">
            Golpes: <span className="font-semibold">{jugadorData.golpesReal ?? 0}</span>
          </p>
          <p style={{ color: '#ef4444' }} className="text-sm">
            Outs: <span className="font-semibold">{jugadorData.outsReal ?? 0}</span>
          </p>
          <p style={{ color: '#f59e0b' }} className="text-sm">
            Atrapadas: <span className="font-semibold">{jugadorData.atrapadasReal ?? 0}</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 mt-3">
      {/* Toggle entre vista de tabla y gráfico */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setVistaActual('tabla')}
              className={`px-3 py-1 text-sm rounded ${
                vistaActual === 'tabla' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 Tabla
            </button>
            <button
              onClick={() => setVistaActual('grafico')}
              className={`px-3 py-1 text-sm rounded ${
                vistaActual === 'grafico' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📈 Gráfico
            </button>
          </div>
          
          {/* Control de escala logarítmica (solo visible en vista gráfico) */}
          {vistaActual === 'grafico' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={escalaLogaritmica}
                  onChange={(e) => setEscalaLogaritmica(e.target.checked)}
                  className="mr-2"
                />
                Escala Logarítmica
              </label>
            </div>
          )}
        </div>
        
        {/* Controles de ordenamiento (solo visible en vista gráfico) */}
        {vistaActual === 'grafico' && (
          <div className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
            
            <select
              value={ordenPor}
              onChange={(e) => setOrdenPor(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="equipo">📋 Por Equipos (separados)</option>
              <option value="throws">🎯 Lanzamientos</option>
              <option value="hits">⚡ Golpes</option>
              <option value="outs">❌ Outs</option>
              <option value="catches">🤲 Atrapadas</option>
            </select>
            
            {ordenPor !== 'equipo' && (
              <button
                onClick={() => setOrdenDireccion(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
                title={ordenDireccion === 'desc' ? 'Mayor a Menor' : 'Menor a Mayor'}
              >
                {ordenDireccion === 'desc' ? '⬇️ Mayor a Menor' : '⬆️ Menor a Mayor'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Vista de Gráfico */}
      {vistaActual === 'grafico' && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            Estadísticas por Jugador {escalaLogaritmica && '(Escala Logarítmica)'}
          </h4>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              {/* Fondos de colores por equipo */}
              <defs>
                {datosGrafico.map((entry, index) => (
                  <pattern
                    key={`pattern-${index}`}
                    id={`pattern-${index}`}
                    patternUnits="userSpaceOnUse"
                    width="100%"
                    height="100%"
                  >
                    <rect width="100%" height="100%" fill={entry.colorFondo} />
                  </pattern>
                ))}
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" />
              
              {/* Eje X con fondo de color por equipo */}
              <XAxis 
                dataKey="nombre" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={(props) => {
                  const { x, y, payload, index } = props;
                  const data = datosGrafico[index];
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <rect
                        x={-20}
                        y={-10}
                        width={40}
                        height={90}
                        fill={data?.colorFondo || '#ffffff'}
                        opacity={0.5}
                      />
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="end"
                        fill="#374151"
                        fontSize={11}
                        fontWeight={500}
                        transform="rotate(-45)"
                      >
                        {payload.value}
                      </text>
                    </g>
                  );
                }}
              />
              
              {/* Eje Y con escala logarítmica opcional */}
              <YAxis 
                scale={escalaLogaritmica ? 'log' : 'linear'}
                domain={escalaLogaritmica ? [0.1, 'auto'] : [0, 'auto']}
                allowDataOverflow={false}
                tickFormatter={(value) => {
                  // En escala log, formatear para ocultar el 0.1 artificial
                  if (escalaLogaritmica && value < 1) {
                    return '0';
                  }
                  return Math.round(value);
                }}
                label={{ 
                  value: 'Cantidad', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: '#6b7280' }
                }}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                shared={true}
                allowEscapeViewBox={{ x: false, y: true }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
              />
              
              <Bar dataKey="Lanzamientos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Golpes" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Outs" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Atrapadas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Leyenda de equipos */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {Object.values(
              datosGrafico.reduce((acc, item) => {
                if (!acc[item.equipoId]) {
                  acc[item.equipoId] = { equipo: item.equipo, color: item.colorFondo };
                }
                return acc;
              }, {})
            ).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-gray-300" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 font-medium">{item.equipo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista de Tabla */}
      {vistaActual === 'tabla' && (
        <>
          {Object.entries(equiposData).map(([equipoId, equipoInfo]) => (
            <div key={equipoId} className="border rounded-lg overflow-hidden bg-white">
              {/* Header del equipo con totales */}
              <div className="bg-blue-600 text-white px-4 py-2">
                <h4 className="font-semibold">{equipoInfo.nombre}</h4>
                <div className="grid grid-cols-4 gap-2 mt-1 text-xs">
                  <div>
                    <span className="opacity-75">Lanzamientos:</span>
                    <span className="ml-1 font-semibold">{equipoInfo.totales.throws}</span>
                  </div>
                  <div>
                    <span className="opacity-75">Golpes:</span>
                    <span className="ml-1 font-semibold">{equipoInfo.totales.hits}</span>
                  </div>
                  <div>
                    <span className="opacity-75">Outs:</span>
                    <span className="ml-1 font-semibold">{equipoInfo.totales.outs}</span>
                  </div>
                  <div>
                    <span className="opacity-75">Atrapadas:</span>
                    <span className="ml-1 font-semibold">{equipoInfo.totales.catches}</span>
                  </div>
                </div>
              </div>

              {/* Tabla de jugadores */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Jugador
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Lanzamientos
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Golpes
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Outs
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Atrapadas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {equipoInfo.jugadores.map((stat, index) => {
                      const jugadorNombre = stat.jugador?.nombre && stat.jugador?.apellido
                        ? `${stat.jugador.nombre} ${stat.jugador.apellido}`
                        : 'Jugador';
                      
                      return (
                        <tr key={stat._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                            {jugadorNombre}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">
                            {stat.throws || 0}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">
                            {stat.hits || 0}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">
                            {stat.outs || 0}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900 text-center">
                            {stat.catches || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
