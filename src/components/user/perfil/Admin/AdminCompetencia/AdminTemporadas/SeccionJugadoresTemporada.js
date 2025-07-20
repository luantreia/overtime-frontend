import React, { useState, useEffect } from 'react';

export default function SeccionJugadoresTemporada({ participacion, token }) {
  const [jugadoresTemporada, setJugadoresTemporada] = useState([]);
  const [jugadorEquipoSeleccionado, setJugadorEquipoSeleccionado] = useState('');
  const [estado, setEstado] = useState('activo');
  const [rol, setRol] = useState('jugador');
  const [jugadorTemporadaEditando, setJugadorTemporadaEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [contratosJugadorEquipo, setContratosJugadorEquipo] = useState([]);

  useEffect(() => {
    if (!token || !participacion?._id) return;
    cargarJugadoresTemporada();
    cargarContratosJugadorEquipo();
  }, [token, participacion]);

  // Carga jugadores temporada filtrados por participacionTemporada
  const cargarJugadoresTemporada = () => {
    fetch(`https://overtime-ddyl.onrender.com/api/jugador-temporada?participacionTemporada=${participacion._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setJugadoresTemporada)
      .catch(err => {
        console.error('Error al cargar jugadores temporada', err);
        setError('No se pudieron cargar los jugadores de la temporada');
      });
  };

  // Carga contratos jugadorEquipo filtrados por equipo de la participacion
  const cargarContratosJugadorEquipo = () => {
    if (!participacion.equipo?._id) return;
    fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?equipo=${participacion.equipo._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setContratosJugadorEquipo)
      .catch(err => {
        console.error('Error al cargar contratos jugador-equipo', err);
        setError('No se pudieron cargar los contratos jugador-equipo');
      });
  };

  const resetFormulario = () => {
    setJugadorEquipoSeleccionado('');
    setEstado('aceptado');
    setRol('jugador');
    setJugadorTemporadaEditando(null);
    setMostrarFormulario(false);
    setError('');
    setMensaje('');
  };

  const enviarJugadorTemporada = async () => {
    setMensaje('');
    setError('');

    if (!jugadorEquipoSeleccionado) {
      setError('Debe seleccionar un jugador');
      return;
    }

    const url = 'https://overtime-ddyl.onrender.com/api/jugador-temporada' + (jugadorTemporadaEditando ? `/${jugadorTemporadaEditando._id}` : '');
    const metodo = jugadorTemporadaEditando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jugadorEquipo: jugadorEquipoSeleccionado,
          participacionTemporada: participacion._id,
          estado,
          rol,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || data.message || 'Error al guardar jugador temporada');

      setMensaje(jugadorTemporadaEditando ? 'Jugador actualizado' : 'Jugador agregado');
      resetFormulario();
      cargarJugadoresTemporada();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const eliminarJugadorTemporada = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este jugador?')) return;

    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-temporada/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al eliminar jugador');

      setMensaje('Jugador eliminado');
      cargarJugadoresTemporada();
    } catch (err) {
      console.error(err);
      setError('Error eliminando jugador');
    }
  };

  const iniciarEdicion = (jt) => {
    setJugadorTemporadaEditando(jt);
    setJugadorEquipoSeleccionado(jt.jugadorEquipo?._id || jt.jugadorEquipo);
    setEstado(jt.estado || 'aceptado');
    setRol(jt.rol || 'jugador');
    setMostrarFormulario(true);
  };

  return (
    <div className="p-3 border rounded bg-gray-50 shadow-inner">
      <h3 className="text-lg font-semibold mb-3">Jugadores en esta Participación</h3>

      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <ul className="mb-4 space-y-1 max-h-72 overflow-auto">
        {jugadoresTemporada.length === 0 && <li className="text-gray-500">No hay jugadores registrados.</li>}
        {jugadoresTemporada.map((jt) => (
          <li key={jt._id} className="p-2 border rounded bg-white flex justify-between items-center">
            <div>
              <strong>{jt.jugadorEquipo?.jugador?.nombre || 'Jugador'}</strong> - <em>{jt.rol}</em> ({jt.estado})
            </div>
            <div className="flex gap-2">
              <button
                className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => iniciarEdicion(jt)}
              >
                Editar
              </button>
              <button
                className="text-sm px-2 py-1 bg-red-600 text-white rounded"
                onClick={() => eliminarJugadorTemporada(jt._id)}
              >
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
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Agregar jugador
        </button>
      )}

      {mostrarFormulario && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Jugador</label>
            <select
              className="w-full border p-2 rounded"
              value={jugadorEquipoSeleccionado}
              onChange={(e) => setJugadorEquipoSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un jugador</option>
              {contratosJugadorEquipo.map((ce) => (
                <option key={ce._id} value={ce._id}>
                  {ce.jugador?.nombre || 'Jugador'} {ce.estado === 'activo' ? '' : `(${ce.estado})`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Estado</label>
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

          <div className="mb-4">
            <label className="block mb-1 font-medium">Rol</label>
            <select
              className="w-full border p-2 rounded"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="jugador">Jugador</option>
              <option value="entrenador">Entrenador</option>
              {/* Agrega más roles si los tienes */}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={enviarJugadorTemporada}
            >
              {jugadorTemporadaEditando ? 'Actualizar' : 'Agregar'}
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
