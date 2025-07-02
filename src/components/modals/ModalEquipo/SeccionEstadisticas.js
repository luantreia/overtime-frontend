import React from 'react';
import useResumenEstadisticasEquipo from '../../../hooks/useResumenEstadisticas/useResumenEstadisticasEquipo';
import RadarPromedios from '../ModalJugador/RadarPromedios';

export default function SeccionEstadisticas({ equipoId }) {
  const { resumen, loading, error } = useResumenEstadisticasEquipo(equipoId);

  if (loading) {
    return (
      
      <section className="bg-gray-100 rounded-xl p-4 mt-2.5 shadow-sm">
        <p className="text-gray-600">Cargando estadísticas del equipo...</p>
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
        <p className="text-gray-600">No hay estadísticas disponibles para este equipo.</p>
      </section>
    );
  }

  return (
    <section className="w-full lg:w-[calc(40%-10px)] bg-gray-100 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas del equipo</h3>
      <RadarPromedios resumen={resumen} />
    </section>
  );
}
