// src/components/modals/ModalPartido/PartidoDatosGenerales.js
import React from 'react';

export default function PartidoDatosGenerales({ partido }) {
  const {
    equipoLocal,
    equipoVisitante,
    fecha,
    ubicacion,
    estado,
    marcadorLocal,
    marcadorVisitante,
  } = partido;

  const fechaFormateada = new Date(fecha).toLocaleString();

  return (
    <section style={{ marginBottom: 20 }}>
      <h3>Datos generales</h3>
      <p><strong>Fecha:</strong> {fechaFormateada}</p>
      <p><strong>Ubicación:</strong> {ubicacion}</p>
      <p><strong>Estado:</strong> {estado}</p>
      <p>
        <strong>Marcador:</strong> {equipoLocal?.nombre} {marcadorLocal} - {marcadorVisitante} {equipoVisitante?.nombre}
      </p>
    </section>
  );
}
