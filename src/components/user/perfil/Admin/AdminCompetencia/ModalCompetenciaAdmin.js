import React, { useEffect, useState } from 'react';
import ModalBase from '../ModalBase';

export default function ModalCompetenciaAdmin({ competenciaId, token, onClose }) {
  const [competencia, setCompetencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!competenciaId) return;

    async function fetchCompetencia() {
      setLoading(true);
      try {
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competenciaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al cargar competencia');
        const data = await res.json();
        setCompetencia(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCompetencia();
  }, [competenciaId, token]);

  if (loading) return <ModalBase title="Cargando competencia..." onClose={onClose}><p>Cargando...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;
  if (!competencia) return null;

  return (
    <ModalBase title={`Competencia: ${competencia.nombre}`} onClose={onClose}>
      <div>
        <p><strong>Tipo:</strong> {competencia.tipo || '-'}</p>
        <p><strong>Estado:</strong> {competencia.estado || '-'}</p>
        {/* Más campos según tu modelo */}
      </div>
    </ModalBase>
  );
}
