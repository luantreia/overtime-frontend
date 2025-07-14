// overtime-frontend/src/components/user/perfil/admin/competencia/fase/ModalFaseAdmin.js

import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../../ModalBase';
import SeccionDatosFase from './SeccionDatosFase';
import SeccionParticipantesFase from './SeccionParticipantesFase';
import SeccionJugadoresFase from './SeccionJugadoresFase';

export default function ModalFaseAdmin({ faseId, token, onClose }) {
  const [fase, setFase] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarFase = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/fases/${faseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar fase');
      const data = await res.json();
      setFase(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [faseId, token]);

  useEffect(() => {
    if (faseId && token) cargarFase();
  }, [cargarFase]);

  if (loading) return <ModalBase title="Cargando..." onClose={onClose}><p>Cargando fase...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;
  if (!fase) return null;

  return (
    <ModalBase title={`Fase: ${fase.nombre}`} onClose={onClose}>
      <SeccionDatosFase fase={fase} token={token} onUpdate={cargarFase} />
      <SeccionParticipantesFase fase={fase} token={token} />
      {/* */}<SeccionJugadoresFase fase={fase} token={token} />
    </ModalBase>
  );
}
