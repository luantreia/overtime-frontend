import React from 'react';
import { MensajeSinDatos } from './MensajeSinDatos';
import { EstadisticasGeneralesHeader } from './EstadisticasGeneralesHeader';
import { EstadisticasCards } from './EstadisticasCards';
import { DistribucionEquiposChart } from './DistribucionEquiposChart';
import { ComparativaEquiposTable } from './ComparativaEquiposTable';

export function renderEstadisticasGenerales(estadisticas, partido, modoEstadisticasUI = 'automatico', modoVisualizacionUI = 'automatico') {

  console.log('🎯 renderEstadisticasGenerales recibió:', {
    modoEstadisticasUI,
    modoVisualizacionUI,
    equiposCount: estadisticas.equipos?.length || 0,
    jugadoresCount: estadisticas.jugadores?.length || 0,
    tieneMensaje: !!estadisticas.mensaje
  });

  // Si hay un mensaje especial (como sin datos manuales), mostrarlo
  if (estadisticas.mensaje && estadisticas.tipo === 'sin-datos-manuales') {
    return <MensajeSinDatos estadisticas={estadisticas} />;
  }

  return (
    <div className="space-y-8">
      <EstadisticasGeneralesHeader modoEstadisticasUI={modoEstadisticasUI} />

      <EstadisticasCards estadisticas={estadisticas} />

      <DistribucionEquiposChart estadisticas={estadisticas} modoEstadisticasUI={modoEstadisticasUI} />

      <ComparativaEquiposTable estadisticas={estadisticas} modoEstadisticasUI={modoEstadisticasUI} />
    </div>
  );
}
