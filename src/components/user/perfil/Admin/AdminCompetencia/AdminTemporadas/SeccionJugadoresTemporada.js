import React, { useEffect, useState } from 'react';

export default function SeccionJugadoresTemporada({ participacion, token }) {
  const [jugadores, setJugadores] = useState([]);
  const [jugadoresEquipo, setJugadoresEquipo] = useState([]);

  const [jugadorEquipoId, setJugadorEquipoId] = useState('');
  const [estado, setEstado] = useState('aceptado');
  const [rol, setRol] = useState('jugador');

  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !participacion?.equipo?._id) return;
    cargarJugadoresTemporada();
    cargarJugadorEquipoDisponibles();
  }, [token, participacion]);

  const cargarJugadoresTemporada = () => {
    fetch(`https://overtime-ddyl.onrender.com/api/jugador-temporada?participacion=${participacion?.equipo?._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setJugadores)
      .catch(() => setError('Error al cargar jugadores de temporada'));
  };

  const cargarJugadorEquipoDisponibles = () => {
    fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?equipo=${participacion?.equipo?._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setJugadoresEquipo)
      .catch(() => setError('Error al cargar jugadores disponibles'));
  };

  const resetFormulario = () => {
    setJugadorEquipoId('');
    setEstado('aceptado');
    setRol('jugador');
    setEditando(null);
    setMostrarFormulario(false);
  };

  const guardarJugador = async () => {
    setMensaje('');
    setError('');
    if (!jugadorEquipoId || !participacion?.equipo?._id) {
      setError('Debe seleccionar un jugador');
      return;
    }

    const payload = {
      jugadorEquipo: jugadorEquipoId,
      participacionTemporada: participacion?.equipo?._id,
      estado,
      rol,
      token,
    };

    const url = `https://overtime-ddyl.onrender.com/api/jugador-temporada` + (editando ? `/${editando._id}` : '');
    const method = editando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar');

      setMensaje(editando ? 'Jugador actualizado' : 'Jugador agregado');
      cargarJugadoresTemporada();
      resetFormulario();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarJugador = async (id) => {
    if (!window.confirm('¿Eliminar jugador de la temporada?')) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-temporada/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar');
      cargarJugadoresTemporada();
    } catch (err) {
      setError(err.message);
    }
  };

  const iniciarEdicion = (j) => {
    setJugadorEquipoId(j.jugadorEquipo?._id || j.jugadorEquipo);
    setEstado(j.estado || 'aceptado');
    setRol(j.rol || 'jugador');
    setEditando(j);
    setMostrarFormulario(true);
  };

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h3 className="font-semibold mb-2">Jugadores de la Temporada</h3>

      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <ul className="space-y-1 mb-4">
        {jugadores.map((j) => (
          <li key={j._id} className="flex justify-between items-center border p-2 rounded">
            <span>
              {j.jugador?.nombre || 'Jugador'} – <span className="italic text-sm">{j.rol}</span> ({j.estado})
            </span>
            <div className="flex gap-2">
              <button onClick={() => iniciarEdicion(j)} className="text-sm bg-blue-500 text-white px-2 py-1 rounded">
                Editar
              </button>
              <button onClick={() => eliminarJugador(j._id)} className="text-sm bg-red-500 text-white px-2 py-1 rounded">
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!mostrarFormulario && (
        <button
          onClick={() => {
            resetFormulario();
            setMostrarFormulario(true);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Agregar jugador
        </button>
      )}

      {mostrarFormulario && (
        <div className="mt-4 border-t pt-4">
          <div className="mb-3">
            <label className="block font-medium mb-1">Jugador Equipo</label>
            <select
              className="w-full border p-2 rounded"
              value={jugadorEquipoId}
              onChange={(e) => setJugadorEquipoId(e.target.value)}
            >
              <option value="">Seleccionar jugador</option>
              {jugadoresEquipo.map((je) => (
                <option key={je._id} value={je._id}>
                  {je.nombreJugadorEquipo || `${je.jugador?.nombre} - ${je.equipo?.nombre}`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">Estado</label>
            <select
              className="w-full border p-2 rounded"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="aceptado">Aceptado</option>
              <option value="baja">Baja</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block font-medium mb-1">Rol</label>
            <select
              className="w-full border p-2 rounded"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="jugador">Jugador</option>
              <option value="entrenador">Entrenador</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={guardarJugador}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              {editando ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              onClick={resetFormulario}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
