import React from 'react';
import useResumenEstadisticasJugador from '../../../hooks/useResumenEstadisticas/useResumenEstadisticasJugador';

export default function SeccionEstadisticasJugador({ jugadorId, token }) {
  const { resumen, loading, error } = useResumenEstadisticasJugador(jugadorId, token);

  if (loading) {
    return (
      <section className="bg-gray-100 rounded-xl p-4 mt-2.5 shadow-sm">
        <p className="text-gray-600">Cargando estadísticas...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-100 rounded-xl p-4 mt-2.5 shadow-sm">
        <p className="text-red-600">Error: {error}</p>
      </section>
    );
  }

  if (!resumen) {
    return (
      <section className="bg-gray-100 rounded-xl p-4 mt-2.5 shadow-sm">
        <p className="text-gray-600">No hay estadísticas disponibles.</p>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 rounded-xl p-4 mt-2.5 shadow-sm"> {/* Refactorizado de styles.seccion */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Estadísticas resumidas</h3> {/* Título de sección */}
      <ul className="list-disc pl-5 space-y-1 text-gray-700"> {/* Estilos para la lista */}
        <li><strong className="font-semibold">Partidos jugados:</strong> {resumen.totalPartidos}</li>
        <li><strong className="font-semibold">Throws totales:</strong> {resumen.totalThrows}</li>
        <li><strong className="font-semibold">Hits totales:</strong> {resumen.totalHits}</li>
        <li><strong className="font-semibold">Outs totales:</strong> {resumen.totalOuts}</li>
        <li><strong className="font-semibold">Catches totales:</strong> {resumen.totalCatches}</li>
        <li><strong className="font-semibold">Promedio throws por partido:</strong> {resumen.promedioThrows}</li>
        <li><strong className="font-semibold">Último partido:</strong> {resumen.ultimoPartido ? new Date(resumen.ultimoPartido.fecha).toLocaleDateString() : 'N/A'}</li>
      </ul>
    </section>
  );
}
