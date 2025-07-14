// ModalOrganizacionAdmin.js
import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import SeccionDatos from './SeccionDatos';
import SeccionAdministradores from './SeccionAdministradores';
import SeccionCompetencias from './SeccionCompetencias';

export default function ModalOrganizacionAdmin({ organizacionId, token, onClose }) {
  const [organizacion, setOrganizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!organizacionId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/organizaciones/${organizacionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar la organización');
      const data = await res.json();
      setOrganizacion(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [organizacionId, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  if (loading) return <ModalBase title="Cargando..." onClose={onClose}><p>Cargando organización...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;
  if (!organizacion) return null;

  return (
    <ModalBase title={`Organización: ${organizacion.nombre}`} onClose={onClose}>
      <SeccionDatos organizacion={organizacion} token={token} onUpdate={cargarDatos} />
      <SeccionAdministradores organizacionId={organizacionId} token={token} />
      <SeccionCompetencias organizacionId={organizacionId} token={token} />
    </ModalBase>
  );
}
