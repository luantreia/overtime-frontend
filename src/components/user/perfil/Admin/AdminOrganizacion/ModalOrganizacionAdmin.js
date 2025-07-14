// ModalOrganizacionAdmin.js
import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import SeccionDatos from './SeccionDatos';
import SeccionAdministradores from './SeccionAdministradores';
import SeccionCompetencias from './SeccionCompetencias';

const SECCIONES = [
  { key: 'datos', label: 'Datos' },
  { key: 'admins', label: 'Administradores' },
  { key: 'competencias', label: 'Competencias' },
];

export default function ModalOrganizacionAdmin({ organizacionId, token, onClose }) {
  const [organizacion, setOrganizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('datos');

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
      {/* Navegación de secciones */}
      <div className="flex gap-2 mb-4 border-b pb-2">
        {SECCIONES.map(({ key, label }) => (
          <button
            key={key}
            className={`px-3 py-1 rounded font-semibold ${seccionActiva === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setSeccionActiva(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido de la sección activa */}
      <div className="space-y-4">
        {seccionActiva === 'datos' && (
          <SeccionDatos organizacion={organizacion} token={token} onUpdate={cargarDatos} />
        )}
        {seccionActiva === 'admins' && (
          <SeccionAdministradores organizacionId={organizacionId} token={token} />
        )}
        {seccionActiva === 'competencias' && (
          <SeccionCompetencias organizacionId={organizacionId} token={token} />
        )}
      </div>
    </ModalBase>
  );
}
