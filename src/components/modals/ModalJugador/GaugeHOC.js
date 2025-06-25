import React, { useState, useMemo } from 'react';
import GaugeHOC from './GaugeHOC'; // este es el gauge tipo velocímetro que ya tenés

export default function GaugeHOCPorPartido({ resumen }) {
  const [partidoSeleccionadoId, setPartidoSeleccionadoId] = useState('');

  const partidoSeleccionado = useMemo(() =>
    resumen.estadisticasPorPartido?.find(p => p._id === partidoSeleccionadoId),
    [resumen.estadisticasPorPartido, partidoSeleccionadoId]
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.titulo}>Comparativa HOC por Partido</h3>

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

      {partidoSeleccionado?.hoc !== undefined && (
        <GaugeHOC valorHOC={parseFloat(partidoSeleccionado.hoc)} />
      )}
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
