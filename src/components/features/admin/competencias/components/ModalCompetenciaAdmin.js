import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../../shared/ModalBase';
import SeccionDatosCompetencia from './SeccionDatosCompetencia';
import SeccionAdministradoresCompetencia from './SeccionAdministradoresCompetencia';
import SeccionTemporadasCompetencia from './SeccionTemporadasCompetencia';
import SeccionHistoricoEquiposYJugadores from './SeccionHistoricoEquiposYJugadores';

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
      <div className="space-y-6">
        {/* Navegación por secciones */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {SECCIONES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSeccionActiva(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  seccionActiva === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
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
      </div>
    </ModalBase>
  );
}
