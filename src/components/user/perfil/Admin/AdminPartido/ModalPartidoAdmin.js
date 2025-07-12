import React, { useEffect, useState } from 'react';
import ModalBase from '../ModalBase';

export default function ModalPartidoAdmin({ partidoId, token, onClose }) {
  const [partido, setPartido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!partidoId) return;

    async function fetchPartido() {
      setLoading(true);
      try {
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/partidos/${partidoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al cargar partido');
        const data = await res.json();
        setPartido(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPartido();
  }, [partidoId, token]);

  if (loading) return <ModalBase title="Cargando partido..." onClose={onClose}><p>Cargando...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;
  if (!partido) return null;

  return (
    <ModalBase title={`Partido: ${partido.titulo || partido._id}`} onClose={onClose}>
      <div>
        <p><strong>Fecha:</strong> {partido.fecha ? new Date(partido.fecha).toLocaleString() : '-'}</p>
        <p><strong>Competencia:</strong> {partido.competencia?.nombre || '-'}</p>
        <p><strong>Estado:</strong> {partido.estado || '-'}</p>
        {/* Más campos según tu modelo */}
      </div>
    </ModalBase>
  );
}
