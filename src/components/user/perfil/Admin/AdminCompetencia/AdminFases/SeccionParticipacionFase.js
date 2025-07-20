import React, { useEffect, useState } from 'react';
import SeccionJugadoresFase from './SeccionJugadoresFase'; // asegurate que esta ruta sea correcta

export default function SeccionParticipacionFase({ faseId, temporadaId, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [participacionesTemporada, setParticipacionesTemporada] = useState([]);

  const [formularioVisible, setFormularioVisible] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mostrarJugadores, setMostrarJugadores] = useState(null);

  const [participacionTemporadaId, setParticipacionTemporadaId] = useState('');
  const [grupo, setGrupo] = useState('');
  const [division, setDivision] = useState('');
  const [puntos, setPuntos] = useState(0);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (faseId) cargarParticipacionesFase();
  }, [faseId]);

  useEffect(() => {
    if (temporadaId) cargarParticipacionesTemporada();
  }, [temporadaId]);

  const cargarParticipacionesFase = async () => {
    try {
      setError('');
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-fase?fase=${faseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setParticipaciones(data);
    } catch (err) {
      setError('Error al cargar participaciones en fase');
    }
  };

  const cargarParticipacionesTemporada = async () => {
    try {
      setError('');
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-temporada?temporada=${temporadaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setParticipacionesTemporada(data);
    } catch (err) {
      setError('Error al cargar participaciones de temporada');
    }
  };

  const resetFormulario = () => {
    setParticipacionTemporadaId('');
    setGrupo('');
    setDivision('');
    setPuntos(0);
    setEditando(null);
    setFormularioVisible(false);
    setMostrarJugadores(null);
  };

  const enviarParticipacion = async () => {
    if (!participacionTemporadaId || !faseId) {
      setError('Debe seleccionar una participación de temporada y tener fase definida');
      return;
    }

    try {
      setError('');
      setMensaje('');
      const url = `https://overtime-ddyl.onrender.com/api/participacion-fase${editando ? `/${editando._id}` : ''}`;
      const metodo = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fase: faseId,
          participacionTemporada: participacionTemporadaId,
          grupo: grupo || null,
          division: division || null,
          puntos: Number(puntos) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar participación');

      setMensaje(editando ? 'Participación actualizada' : 'Participación creada');
      resetFormulario();
      cargarParticipacionesFase();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarParticipacion = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta participación?')) return;

    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-fase/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al eliminar participación');

      setMensaje('Participación eliminada');
      cargarParticipacionesFase();
    } catch (err) {
      setError(err.message);
    }
  };

  const iniciarEdicion = (p) => {
    setEditando(p);
    setParticipacionTemporadaId(p.participacionTemporada?._id || p.participacionTemporada);
    setGrupo(p.grupo || '');
    setDivision(p.division || '');
    setPuntos(p.puntos || 0);
    setFormularioVisible(true);
    setMostrarJugadores(null);
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Participaciones en Fase</h2>

      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Lista de Participaciones */}
      <ul className="mb-4 space-y-2">
        {participaciones.map((p) => (
          <li key={p._id} className="p-2 border rounded">
            <div className="flex justify-between items-center">
              <span>
                {p.participacionTemporada?.equipo?.nombre || 'Equipo'} — Grupo: {p.grupo || '-'} — División: {p.division || '-'} — Puntos: {p.puntos}
              </span>
              <div className="flex gap-2">
                <button
                  className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => iniciarEdicion(p)}
                >
                  Editar
                </button>
                <button
                  className="text-sm px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => eliminarParticipacion(p._id)}
                >
                  Eliminar
                </button>
                <button
                  className="text-sm px-2 py-1 bg-gray-600 text-white rounded"
                  onClick={() => setMostrarJugadores(p._id === mostrarJugadores ? null : p._id)}
                >
                  Jugadores
                </button>
              </div>
            </div>
            {mostrarJugadores === p._id && (
              <div className="mt-2">
                <SeccionJugadoresFase participacion={p} token={token} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {!formularioVisible && (
        <button
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            resetFormulario();
            setFormularioVisible(true);
          }}
        >
          Agregar participación
        </button>
      )}

      {formularioVisible && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Participación Temporada</label>
            <select
              className="w-full border p-2 rounded"
              value={participacionTemporadaId}
              onChange={(e) => setParticipacionTemporadaId(e.target.value)}
            >
              <option value="">Seleccione un equipo</option>
              {participacionesTemporada.map((pt) => (
                <option key={pt._id} value={pt._id}>
                  {pt.equipo?.nombre || 'Sin nombre'} — Estado: {pt.estado}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Grupo</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Ej: A, B, 1"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">División</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="Ej: Primera, Segunda"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Puntos</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={puntos}
              onChange={(e) => setPuntos(e.target.value)}
              min={0}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={enviarParticipacion}
            >
              {editando ? 'Actualizar' : 'Registrar'}
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              onClick={resetFormulario}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
