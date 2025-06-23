import React, { useState, useMemo } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip
} from 'recharts';

function transformar(valor) {
  // Aplicamos sqrt para aplanar la escala, si es null o undefined devolvemos null
  if (valor === null || valor === undefined) return null;
  return Math.sqrt(valor);
}

export default function RadarPromedios({ resumen }) {
  const [partidoSeleccionadoId, setPartidoSeleccionadoId] = useState('');

  const partidoSeleccionado = useMemo(() =>
    resumen.estadisticasPorPartido?.find(p => p._id === partidoSeleccionadoId)
  , [resumen.estadisticasPorPartido, partidoSeleccionadoId]);

  const data = [
    {
      subject: 'Hits',
      Promedio: transformar(parseFloat(resumen.promedioHits) || 0),
      Partido: partidoSeleccionado ? transformar(partidoSeleccionado.hits) : null,
      rawPromedio: parseFloat(resumen.promedioHits) || 0,
      rawPartido: partidoSeleccionado ? partidoSeleccionado.hits : null,
    },
    {
      subject: 'Outs',
      Promedio: transformar(parseFloat(resumen.promedioOuts) || 0),
      Partido: partidoSeleccionado ? transformar(partidoSeleccionado.outs) : null,
      rawPromedio: parseFloat(resumen.promedioOuts) || 0,
      rawPartido: partidoSeleccionado ? partidoSeleccionado.outs : null,
    },
    {
      subject: 'Catches',
      Promedio: transformar(parseFloat(resumen.promedioCatches) || 0),
      Partido: partidoSeleccionado ? transformar(partidoSeleccionado.catches) : null,
      rawPromedio: parseFloat(resumen.promedioCatches) || 0,
      rawPartido: partidoSeleccionado ? partidoSeleccionado.catches : null,
    },
    {
      subject: 'Sets jugados',
      Promedio: transformar(parseFloat(resumen.promedioSetsPorPartido) || 0),
      Partido: partidoSeleccionado ? transformar(partidoSeleccionado.setsJugados) : null,
      rawPromedio: parseFloat(resumen.promedioSetsPorPartido) || 0,
      rawPartido: partidoSeleccionado ? partidoSeleccionado.setsJugados : null,
    },
    {
      subject: 'Efectividad (%)',
      Promedio: transformar(parseFloat(resumen.efectividadPromedio) || 0),
      Partido: partidoSeleccionado && partidoSeleccionado.efectividad !== null
        ? transformar(parseFloat(partidoSeleccionado.efectividad))
        : null,
      rawPromedio: parseFloat(resumen.efectividadPromedio) || 0,
      rawPartido: partidoSeleccionado && partidoSeleccionado.efectividad !== null
        ? parseFloat(partidoSeleccionado.efectividad)
        : null,
    }
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.titulo}>Comparativa Promedio vs Partido</h3>

      {resumen.estadisticasPorPartido?.length > 0 && (
        <select
          value={partidoSeleccionadoId}
          onChange={e => setPartidoSeleccionadoId(e.target.value)}
          style={styles.select}
        >
          <option value="">Seleccionar partido</option>
          {resumen.estadisticasPorPartido.map(p => (
            <option key={p._id} value={p._id}>
              {new Date(p.fecha).toLocaleDateString()} - {p.liga}
            </option>
          ))}
        </select>
      )}

      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#ccc" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#333', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#aaa" />
          <Radar
            name="Promedio"
            dataKey="Promedio"
            stroke="#FFB300"
            fill="#FFB300"
            fillOpacity={0.3}
          />
          {partidoSeleccionado && (
            <Radar
              name="Partido"
              dataKey="Partido"
              stroke="#333333"
              fill="#333333"
              fillOpacity={0.3}
            />
          )}
          <Tooltip
            // Mostramos valor real, no transformado, para que sea claro
            formatter={(value, name, entry) => {
              if (!entry) return 'N/A';
              // Si tooltip es Promedio mostramos rawPromedio, si es Partido mostramos rawPartido
              if (name === 'Promedio') return entry.payload.rawPromedio?.toFixed(2) ?? 'N/A';
              if (name === 'Partido') return entry.payload.rawPartido?.toFixed(2) ?? 'N/A';
              return value;
            }}
            contentStyle={{ backgroundColor: '#f0f0f0', borderRadius: 8, border: 'none' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  container: {
    padding: '10px 0',
    backgroundColor: 'var(--color-secundario)',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginTop: '20px',
  },
  titulo: {
    textAlign: 'center',
    marginBottom: '15px',
    color: '#333',
    fontSize: '18px',
  },
  select: {
    display: 'block',
    margin: '0 auto 20px',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
};
