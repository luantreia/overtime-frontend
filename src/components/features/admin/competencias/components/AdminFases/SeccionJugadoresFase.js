import React, { useState, useEffect } from 'react';

export default function SeccionJugadoresFase({ participacionFase, token }) {
  const [jugadoresFase, setJugadoresFase] = useState([]);
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState([]);
  const [jugadorTemporadaSeleccionado, setJugadorTemporadaSeleccionado] = useState('');
  const [estado, setEstado] = useState('activo');
  const [rol, setRol] = useState('jugador');
  const [numero, setNumero] = useState('');
  const [jugadorFaseEditando, setJugadorFaseEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !participacionFase?._id) return;
    cargarJugadoresFase();
    cargarJugadoresDisponibles();
  }, [token, participacionFase]);

  // Carga jugadores asignados a la fase (JugadorFase con populated jugadorTemporada -> jugador)
  const cargarJugadoresFase = async () => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-fase?participacionFase=${participacionFase._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar jugadores de fase');
      const data = await res.json();
      setJugadoresFase(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Carga jugadores disponibles (Jugadores de la participación temporada para el equipo de esta fase)
  const cargarJugadoresDisponibles = async () => {
    if (!participacionFase.participacionTemporada) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-temporada?participacionTemporada=${participacionFase.participacionTemporada}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar jugadores disponibles');
      const data = await res.json();
      setJugadoresDisponibles(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const resetFormulario = () => {
    setJugadorTemporadaSeleccionado('');
    setEstado('activo');
    setRol('jugador');
    setNumero('');
    setJugadorFaseEditando(null);
    setMostrarFormulario(false);
    setError('');
    setMensaje('');
  };

  const enviarJugadorFase = async () => {
    setMensaje('');
    setError('');

    if (!jugadorTemporadaSeleccionado) {
      setError('Debe seleccionar un jugador');
      return;
    }

    const url = `https://overtime-ddyl.onrender.com/api/jugador-fase${jugadorFaseEditando ? `/${jugadorFaseEditando._id}` : ''}`;
    const metodo = jugadorFaseEditando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participacionFase: participacionFase._id,
          jugadorTemporada: jugadorTemporadaSeleccionado,
          estado,
          rol,
          numero: numero ? Number(numero) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al guardar jugador en fase');

      setMensaje(jugadorFaseEditando ? 'Jugador actualizado' : 'Jugador agregado');
      resetFormulario();
      cargarJugadoresFase();
      cargarJugadoresDisponibles();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const eliminarJugadorFase = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este jugador de la fase?')) return;

    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-fase/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al eliminar jugador de la fase');

      setMensaje('Jugador eliminado');
      cargarJugadoresFase();
      cargarJugadoresDisponibles();
    } catch (err) {
      console.error(err);
      setError('Error eliminando jugador de la fase');
    }
  };

  const iniciarEdicion = (jf) => {
    setJugadorFaseEditando(jf);
    setJugadorTemporadaSeleccionado(jf.jugadorTemporada?._id || jf.jugadorTemporada);
    setEstado(jf.estado || 'activo');
    setRol(jf.rol || 'jugador');
    setNumero(jf.numero || '');
    setMostrarFormulario(true);
  };

  return (
    <div className="p-3 border rounded bg-gray-50 shadow-inner">
      <h3 className="text-lg font-semibold mb-3">Jugadores en esta Participación de Fase</h3>

      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <ul className="mb-4 space-y-1 max-h-72 overflow-auto">
        {jugadoresFase.length === 0 && <li className="text-gray-500">No hay jugadores registrados en esta fase.</li>}
        {jugadoresFase.map((jf) => (
          <li key={jf._id} className="p-2 border rounded bg-white flex justify-between items-center">
            <div>
              <strong>{jf.jugadorTemporada?.jugador?.nombre || 'Jugador'}</strong> - <em>{jf.rol}</em> ({jf.estado}) — Nº {jf.numero || '-'}
            </div>
            <div className="flex gap-2">
              <button
                className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => iniciarEdicion(jf)}
              >
                Editar
              </button>
              <button
                className="text-sm px-2 py-1 bg-red-600 text-white rounded"
                onClick={() => eliminarJugadorFase(jf._id)}
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
          Agregar jugador a la fase
        </button>
      )}

      {mostrarFormulario && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Jugador</label>
            <select
              className="w-full border p-2 rounded"
              value={jugadorTemporadaSeleccionado}
              onChange={(e) => setJugadorTemporadaSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un jugador</option>
              {jugadoresDisponibles.map((jt) => (
                <option key={jt._id} value={jt._id}>
                  {jt.jugadorEquipo?.jugador?.nombre || 'Jugador'} {jt.estado === 'activo' ? '' : `(${jt.estado})`}
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
              <option value="activo">Activo</option>
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
              {/* Añadir otros roles si aplican */}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Número</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              min={0}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={enviarJugadorFase}
            >
              {jugadorFaseEditando ? 'Actualizar' : 'Agregar'}
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
