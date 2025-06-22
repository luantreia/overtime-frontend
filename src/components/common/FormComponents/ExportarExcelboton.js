import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ExportarExcelBoton({ partido }) {
  const exportar = () => {
    if (!partido?.sets?.length) {
      alert("No hay sets cargados para exportar.");
      return;
    }

    const rowsEstadisticas = [];
    const resumenPorJugador = {};

    partido.sets.forEach(set => {
      set.statsJugadoresSet?.forEach(stat => {
        const equipoNombre = stat.equipo === partido.equipoLocal._id
          ? partido.equipoLocal.nombre
          : partido.equipoVisitante.nombre;

        const jugadorObj = typeof stat.jugador === 'object' ? stat.jugador : null;
        const jugadorId = jugadorObj?._id || stat.jugador;
        const nombreJugador = jugadorObj?.nombre || jugadorObj?.alias || 'Jugador desconocido';

        // Hoja principal
        rowsEstadisticas.push({
          Set: set.numeroSet,
          Equipo: equipoNombre,
          Jugador: nombreJugador,
          Throws: stat.estadisticas.throws,
          Hits: stat.estadisticas.hits,
          Outs: stat.estadisticas.outs,
          Catches: stat.estadisticas.catches,
        });

        // Hoja de resumen acumulado
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

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `partido-${partido._id}.xlsx`);
  };

  return (
    <button onClick={exportar} style={botonStyle}>
      Exportar a Excel
    </button>
  );
}

const botonStyle = {
  marginTop: '10px',
  padding: '10px 15px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};
