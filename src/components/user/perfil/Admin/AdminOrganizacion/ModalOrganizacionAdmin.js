import React, { useEffect, useState } from 'react';
import ModalBase from '../ModalBase';

export default function ModalOrganizacionAdmin({ organizacionId, token, onClose }) {
  const [organizacion, setOrganizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!organizacionId) return;

    async function fetchOrganizacion() {
      setLoading(true);
      try {
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/organizaciones/${organizacionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al cargar organización');
        const data = await res.json();
        setOrganizacion(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizacion();
  }, [organizacionId, token]);

  if (loading) return <ModalBase title="Cargando organización..." onClose={onClose}><p>Cargando...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;
  if (!organizacion) return null;

  return (
    <ModalBase title={`Organización: ${organizacion.nombre}`} onClose={onClose}>
      <div>
        <p><strong>Tipo:</strong> {organizacion.tipo || '-'}</p>
        <p><strong>País:</strong> {organizacion.pais || '-'}</p>
        {/* Más campos según tu modelo */}
      </div>
    </ModalBase>
  );
}
