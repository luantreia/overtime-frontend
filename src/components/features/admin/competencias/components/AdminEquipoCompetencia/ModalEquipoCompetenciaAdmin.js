import React, { useState, useEffect, useCallback } from 'react';
import ModalBase from '../../../shared/ModalBase';
import { useAuth } from '../../../../../../context/AuthContext.js';

import SeccionContratosJugadorCompetencia from './SeccionContratosJugadorCompetencia.js';
import SeccionDatosEquipoCompetencia from './SeccionDatosEquipoCompetencia';
import SeccionParticipacionTemporada from './SeccionParticipacionTemporada';

const SECCIONES = [
  { key: 'datos', label: 'Datos' },
  { key: 'jugadores', label: 'Jugadores' },
  { key: 'participacion', label: 'Temporadas' },
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

  // Permisos: sólo puede editar/eliminar si es admin o creador
  const puedeEditarEliminar = (() => {
    if (!equipoCompetencia) return false;
    const esAdminEquipo = equipoCompetencia.equipo?.creadoPor === usuarioId || (equipoCompetencia.equipo?.administradores || []).includes(usuarioId);
    const esAdminCompetencia = equipoCompetencia.competencia?.creadoPor === usuarioId || (equipoCompetencia.competencia?.administradores || []).includes(usuarioId);
    return esAdminEquipo || esAdminCompetencia || rol === 'admin';
  })();

  // Actualizar estado
  const actualizarEstado = async (nuevoEstado) => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/equipos-competencia/${equipoCompetencia._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Error actualizando estado');
      }
      await cargarDatos();
    } catch (error) {
      alert(error.message);
      throw error;
    }
  };

  // Eliminar contrato
  const eliminarContrato = async () => {
    if (!window.confirm('¿Seguro que querés eliminar este contrato?')) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/equipos-competencia/${equipoCompetencia._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.message || 'Error al eliminar contrato');
        return;
      }
      onClose(); // cerrar modal después de eliminar
    } catch (error) {
      alert(error.message);
    }
  };

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
            onActualizado={() => cargarDatos()}
            onEliminado={onClose}
            puedeEditar={puedeEditarEliminar}
            puedeEliminar={puedeEditarEliminar}
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
      case 'participacion':
        return (
          <SeccionParticipacionTemporada
            equipoId={equipo._id}
            token={token}
            competenciaId={competenciaId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ModalBase open={true} onClose={onClose} title={`Equipo: ${equipo?.nombre || '...'}`}>
      <div className="space-y-6">
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
        <div className="space-y-4">{renderContenido()}</div>
      </div>
    </ModalBase>
  );
}
