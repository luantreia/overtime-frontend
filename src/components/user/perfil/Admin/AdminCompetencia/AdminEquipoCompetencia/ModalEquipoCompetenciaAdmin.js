import React, { useState, useEffect, useCallback } from 'react';
import ModalBase from '../../ModalBase';
import { useAuth } from '../../../../../../context/AuthContext.js';

import SeccionContratosJugadorCompetencia from './SeccionContratosJugadorCompetencia.js';
import SeccionDatosEquipoCompetencia from './SeccionDatosEquipoCompetencia';
import SeccionContratosEquiposCompetencia from '../SeccionContratosEquiposCompetencia';

const SECCIONES = [
  { key: 'datos', label: 'Datos' },
  { key: 'jugadores', label: 'Jugadores' },
];

export default function ModalEquipoCompetenciaAdmin({ competenciaId, equipoCompetencia, token, onClose, abierto }) {
  const { user } = useAuth();
  const usuarioId = user?.uid;
  const rol = user?.rol;

  const [seccionActiva, setSeccionActiva] = useState('datos');
  const [equipo, setEquipo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!equipoCompetencia?.equipo?._id || !token) return;

    setLoading(true);
    setError(null);

    try {
      const [resEquipo, resJugadores] = await Promise.all([
        fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoCompetencia.equipo._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?equipo=${equipoCompetencia.equipo._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resEquipo.ok || !resJugadores.ok) {
        throw new Error('Error al cargar datos del equipo o jugadores');
      }

      const dataEquipo = await resEquipo.json();
      const dataJugadores = await resJugadores.json();

      setEquipo(dataEquipo);
      setJugadores(dataJugadores);
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [equipoCompetencia, token]);

  useEffect(() => {
    if (abierto) {
      cargarDatos();
    }
  }, [abierto, cargarDatos]);

  if (!abierto) return null;

  const renderContenido = () => {
    if (loading) return <p>Cargando equipo...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (!equipo) return <p>No se encontró información del equipo.</p>;

    switch (seccionActiva) {
      case 'datos':
        return (
          <SeccionDatosEquipoCompetencia
            equipoCompetencia={equipoCompetencia}
            token={token}
            onUpdate={cargarDatos}
          />
        );
      case 'jugadores':
        return (
          <SeccionContratosJugadorCompetencia
            competenciaId={competenciaId}
            token={token}
            equipoId={equipo._id}
          />
        );
      case 'contratos':
        return (
          <SeccionContratosEquiposCompetencia
            equipoId={equipo._id}
            competenciaId={equipoCompetencia.competencia}
            token={token}
            usuarioId={usuarioId}
            rol={rol}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalBase open={true} onClose={onClose} title={`Equipo: ${equipo?.nombre || '...'}`}>
      {/* Navegación entre secciones */}
      <nav className="flex gap-2 mb-4 border-b pb-2">
        {SECCIONES.map(({ key, label }) => (
          <button
            key={key}
            className={`px-3 py-1 rounded font-semibold ${
              seccionActiva === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => setSeccionActiva(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Contenido de la sección activa */}
      <div className="space-y-4">{renderContenido()}</div>
    </ModalBase>
  );
}
