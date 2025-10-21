import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ExportarExcelBoton({ partido }) {
  const exportar = () => {
    if (!partido?.sets?.length) {
      // Using a custom alert/modal is recommended instead of native alert()
      // For now, keeping alert() as per original code, but noting the best practice.
      alert("No hay sets cargados para exportar.");
      return;
    }

    const rowsEstadisticas = [];
    const resumenPorJugador = {};

    partido.sets.forEach(set => {
      set.statsJugadoresSet?.forEach(stat => {
        const equipoNombre =
          stat.equipo === partido.equipoLocal._id
            ? partido.equipoLocal.nombre
            : partido.equipoVisitante.nombre;

        const jugadorObj = typeof stat.jugador === 'object' ? stat.jugador : null;
        const jugadorId = jugadorObj?._id || stat.jugador;
        const nombreJugador =
          jugadorObj?.alias?.trim() ||
          jugadorObj?.nombre?.trim() ||
          `Jugador ${jugadorId?.substring(0, 6) || 'desconocido'}`;
        
        // Main sheet data
        rowsEstadisticas.push({
          Set: set.numeroSet,
          Equipo: equipoNombre,
          Jugador: nombreJugador,
          Throws: stat.estadisticas.throws || 0,
          Hits: stat.estadisticas.hits || 0,
          Outs: stat.estadisticas.outs || 0,
          Catches: stat.estadisticas.catches || 0,
        });

        // Accumulate summary data per player
        if (!resumenPorJugador[jugadorId]) {
          resumenPorJugador[jugadorId] = {
            Jugador: nombreJugador,
            Throws: 0,
            Hits: 0,
            Outs: 0,
            Catches: 0,
          };
        }

        resumenPorJugador[jugadorId].Throws += stat.estadisticas.throws || 0;
        resumenPorJugador[jugadorId].Hits += stat.estadisticas.hits || 0;
        resumenPorJugador[jugadorId].Outs += stat.estadisticas.outs || 0;
        resumenPorJugador[jugadorId].Catches += stat.estadisticas.catches || 0;
      });
    });

    const resumenData = Object.values(resumenPorJugador);

    const workbook = XLSX.utils.book_new();
    const hojaEstadisticas = XLSX.utils.json_to_sheet(rowsEstadisticas);
    XLSX.utils.book_append_sheet(workbook, hojaEstadisticas, 'Estadísticas');

    const hojaResumen = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(workbook, hojaResumen, 'Resumen Jugadores');

    const nombrePartido = `${partido.equipoLocal?.nombre || 'Partido'}_vs_${partido.equipoVisitante?.nombre || 'Desconocido'}`.replace(/\s+/g, '_');
    const nombreArchivo = `estadisticas_${nombrePartido}.xlsx`;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, nombreArchivo);
  };

  return (
    <button
      onClick={exportar}
      // Tailwind CSS classes for the button
      className="mt-2 px-4 py-2 bg-green-600 text-white font-medium rounded-md
                 hover:bg-green-700 transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      Exportar a Excel
    </button>
  );
}