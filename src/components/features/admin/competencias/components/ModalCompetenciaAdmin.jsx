import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../../shared/ModalBase.jsx';
import SeccionDatosCompetencia from './AdminCompetencia/SeccionDatosCompetencia';
import SeccionAdministradoresCompetencia from './AdminCompetencia/SeccionAdministradoresCompetencia';
import SeccionTemporadasCompetencia from './AdminCompetencia/SeccionTemporadasCompetencia';
import SeccionHistoricoEquiposYJugadores from './AdminCompetencia/SeccionHistoricoEquiposYJugadores';

import { useAuth } from '../../../../../context/AuthContext.js';

const SECCIONES = [
  { key: 'datos', label: 'Datos' },
  { key: 'admins', label: 'Administradores' },
  { key: 'temporadas', label: 'Temporadas' },
  { key: 'historico', label: 'Histórico Equipos/Jugadores' },
];

export default function ModalCompetenciaAdmin({ competenciaId, token, onClose }) {
  const { user } = useAuth();
  const usuarioId = user?.uid;
  const rol = user?.rol;
  const [competencia, setCompetencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccionActiva, setSeccionActiva] = useState('datos'); // 👉 por defecto muestra datos

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
      {/* Menú de navegación */}
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
          <SeccionDatosCompetencia competencia={competencia} token={token} onUpdate={cargarDatos} />
        )}
        {seccionActiva === 'admins' && (
          <SeccionAdministradoresCompetencia competenciaId={competenciaId} token={token} />
        )}
        {seccionActiva === 'temporadas' && (
          <SeccionTemporadasCompetencia competenciaId={competencia._id} token={token} />
        )}
        {seccionActiva === 'historico' && (
          <SeccionHistoricoEquiposYJugadores competenciaId={competencia._id} token={token} />
        )}

      </div>
    </ModalBase>
  );
}
