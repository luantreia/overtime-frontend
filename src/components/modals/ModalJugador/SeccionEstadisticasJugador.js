import React from 'react';
import useResumenEstadisticasJugador from '../../../hooks/useResumenEstadisticasJugador';

export default function SeccionEstadisticasJugador({ jugadorId, token }) {
  const { resumen, loading, error } = useResumenEstadisticasJugador(jugadorId, token);

  if (loading) return <p>Cargando estadísticas...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!resumen) return <p>No hay estadísticas disponibles.</p>;

  return (
    <section style={styles.seccion}>
      <h3>Estadísticas resumidas</h3>
      <ul>
        <li><strong>Partidos jugados:</strong> {resumen.totalPartidos}</li>
        <li><strong>Throws totales:</strong> {resumen.totalThrows}</li>
        <li><strong>Hits totales:</strong> {resumen.totalHits}</li>
        <li><strong>Outs totales:</strong> {resumen.totalOuts}</li>
        <li><strong>Catches totales:</strong> {resumen.totalCatches}</li>
        <li><strong>Promedio throws por partido:</strong> {resumen.promedioThrows}</li>
        <li><strong>Último partido:</strong> {resumen.ultimoPartido ? new Date(resumen.ultimoPartido.fecha).toLocaleDateString() : 'N/A'}</li>
      </ul>
    </section>
  );
}

const styles = {
  seccion: {
    backgroundColor: 'var(--color-secundario)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  }
};
