import React, { useState, useEffect } from 'react';
import { useEquipoCompetencia } from '../../../hooks/useEquiposCompetencia';
import { useParticipacionFase } from '../../../hooks/useParticipacionFase';

export default function EditorEquiposFase({ competenciaId, fases }) {
  const [faseSeleccionadaId, setFaseSeleccionadaId] = useState(fases?.[0]?._id || null);
  const { equiposCompetencia, loading: loadingEquiposComp, error: errorEquiposComp } = useEquipoCompetencia(competenciaId);

  const {
    participaciones,
    fetchParticipaciones,
    crearParticipacion,
    eliminarParticipacion,
    loading: loadingParticipaciones,
    error: errorParticipaciones,
  } = useParticipacionFase();

  const [nuevoEquipoId, setNuevoEquipoId] = useState('');

  // Cargar participaciones cuando cambia la fase seleccionada
  useEffect(() => {
    if (faseSeleccionadaId) {
      fetchParticipaciones({ fase: faseSeleccionadaId });
      setNuevoEquipoId('');
    }
  }, [faseSeleccionadaId, fetchParticipaciones]);

  // Cargando
  if (loadingEquiposComp || loadingParticipaciones) return <p>Cargando...</p>;

  // Manejo de errores
  if (errorEquiposComp) return <p className="text-red-600">Error al cargar equipos: {errorEquiposComp}</p>;
  if (errorParticipaciones) return <p className="text-red-600">Error al cargar participaciones: {errorParticipaciones}</p>;

  // IDs de equipos ya asignados a la fase
  const equiposAsignadosIds = new Set(participaciones.map(p => p.equipoCompetencia._id.toString()));

  // Equipos disponibles para agregar (que están en competencia pero no en esta fase)
  const equiposDisponibles = equiposCompetencia.filter(eq => !equiposAsignadosIds.has(eq._id.toString()));

  // Objeto fase actual para usar datos extra (división, grupo)
  const faseSeleccionada = fases.find(f => f._id === faseSeleccionadaId);

  // Agregar equipo a la fase
  const handleAgregar = async () => {
    if (!nuevoEquipoId || !faseSeleccionada) return;

    await crearParticipacion({
      equipoCompetencia: nuevoEquipoId,
      fase: faseSeleccionada._id,
      division: faseSeleccionada.tipo === 'liga' ? faseSeleccionada.division : undefined,
      grupo: faseSeleccionada.tipo === 'grupo' ? faseSeleccionada.grupo : undefined,
    });

    await fetchParticipaciones({ fase: faseSeleccionada._id });
    setNuevoEquipoId('');
  };

  // Eliminar equipo de la fase
  const handleEliminar = async (participacionId) => {
    await eliminarParticipacion(participacionId);
    await fetchParticipaciones({ fase: faseSeleccionada._id });
  };

  return (
    <div>
      {/* Selector de fase */}
      <div className="mb-4">
        <label htmlFor="select-fase" className="block font-semibold mb-1">Seleccionar fase:</label>
        <select
          id="select-fase"
          className="border rounded px-2 py-1"
          value={faseSeleccionadaId || ''}
          onChange={e => setFaseSeleccionadaId(e.target.value)}
        >
          {fases.map(f => (
            <option key={f._id} value={f._id}>
              {f.nombre} ({f.tipo}{f.tipo === 'liga' && f.division ? ` - División ${f.division}` : ''})
            </option>
          ))}
        </select>
      </div>

      {/* Equipos asignados a la fase */}
      <div className="mb-6">
        <h4 className="font-bold text-lg mb-2">Equipos asignados a la fase</h4>
        {participaciones.length === 0 ? (
          <p>No hay equipos asignados a esta fase.</p>
        ) : (
          <ul className="space-y-1">
            {participaciones.map(p => (
              <li key={p._id} className="flex justify-between items-center border rounded p-2">
                <span>{p.equipoCompetencia.equipo.nombre}</span>
                <button
                  className="text-red-600 text-sm"
                  onClick={() => handleEliminar(p._id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Agregar nuevo equipo */}
      {equiposDisponibles.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1"
            value={nuevoEquipoId}
            onChange={e => setNuevoEquipoId(e.target.value)}
          >
            <option value="">Seleccionar equipo para agregar</option>
            {equiposDisponibles.map(eq => (
              <option key={eq._id} value={eq._id}>
                {eq.equipo?.nombre || 'Sin nombre'}
              </option>
            ))}
          </select>
          <button
            className="bg-blue-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50"
            disabled={!nuevoEquipoId}
            onClick={handleAgregar}
          >
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}
