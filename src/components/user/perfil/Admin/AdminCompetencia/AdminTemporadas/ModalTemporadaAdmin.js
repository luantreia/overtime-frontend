import React from 'react';
import ModalBase from '../../ModalBase';
import SeccionFasesTemporada from './SeccionFasesTemporada';
import SeccionEquiposTemporada from './SeccionEquiposTemporada';

export default function ModalTemporadaAdmin({ competenciaId, temporada, onClose, token }) {
  if (!temporada) return null;

  return (
    <ModalBase open={!!temporada} onClose={onClose} title={`Temporada: ${temporada?.nombre}`}>
      <div className="space-y-6">
        {/* Info básica de la temporada */}
        <div>
          <h4 className="font-semibold">Descripción</h4>
          <p>{temporada.descripcion || '-'}</p>
          <p className="text-sm text-gray-500">
            {temporada.fechaInicio?.slice(0, 10)} - {temporada.fechaFin?.slice(0, 10)}
          </p>
        </div>

        {/* Sección para gestionar fases */}
        <SeccionFasesTemporada temporada temporadaId={temporada._id} token={token} />
        <SeccionEquiposTemporada competenciaId={competenciaId} temporada={temporada} temporadaId={temporada._id} token={token} />
      </div>
    </ModalBase>
  );
}
