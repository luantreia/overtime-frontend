import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import SeccionDatosCompetencia from './SeccionDatosCompetencia';
import SeccionAdministradoresCompetencia from './SeccionAdministradoresCompetencia';
import SeccionFasesCompetencia from './SeccionFasesCompetencia';
import SeccionContratoEquiposCompetencia from './SeccionContratoEquiposCompetencia';

export default function ModalCompetenciaAdmin({ competenciaId, token, onClose }) {
  const [competencia, setCompetencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!competenciaId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competenciaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar la competencia');
      const data = await res.json();
      setCompetencia(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [competenciaId, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  if (loading) return <ModalBase title="Cargando..." onClose={onClose}><p>Cargando competencia...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;
  if (!competencia) return null;

  return (
    <ModalBase title={`Competencia: ${competencia.nombre}`} onClose={onClose}>
      <SeccionDatosCompetencia competencia={competencia} token={token} onUpdate={cargarDatos} />
      <SeccionAdministradoresCompetencia competenciaId={competenciaId} token={token} />
      <SeccionContratoEquiposCompetencia competenciaId={competencia._id} token={token} />
      <SeccionFasesCompetencia competenciaId={competenciaId} token={token} />
      {/* */}
    </ModalBase>
    
  );
}
