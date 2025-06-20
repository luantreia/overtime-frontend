// components/ExportarExcelBoton.js
import React from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ExportarExcelBoton({ partido }) {
    const exportar = () => {
        const rows = [];

        partido.sets.forEach(set => {
            set.statsJugadoresSet.forEach(stat => {
            const equipoNombre = stat.equipo === partido.equipoLocal._id
                ? partido.equipoLocal.nombre
                : partido.equipoVisitante.nombre;

            // Si 'jugador' es un objeto con nombre o alias
            const nombreJugador = typeof stat.jugador === 'object'
            ? stat.jugador.nombre || stat.jugador.alias || 'Jugador desconocido'
            : stat.jugador;

            rows.push({
            Set: set.numeroSet,
            Equipo: equipoNombre,
            Jugador: nombreJugador,
            Throws: stat.estadisticas.throws,
            Hits: stat.estadisticas.hits,
            Outs: stat.estadisticas.outs,
            Catches: stat.estadisticas.catches,
            });
            });
        });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estadísticas');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `partido-${partido._id}.xlsx`);
  };

  return (
    <button onClick={exportar}>
      Exportar a Excel
    </button>
  );
}
