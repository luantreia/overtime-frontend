import React, { useState, useEffect } from 'react';
import SeccionJugadoresTemporada from './SeccionJugadoresTemporada'; // Asegurate de importar correctamente

export default function SeccionParticipacionTemporada({ temporadaId, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [estado, setEstado] = useState('activo');
  const [observaciones, setObservaciones] = useState('');
  const [participacionEditando, setParticipacionEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarJugadores, setMostrarJugadores] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !temporadaId) return;
    cargarParticipaciones();
    cargarEquipos();
  }, [token, temporadaId]);

  const cargarParticipaciones = () => {
    fetch(`https://overtime-ddyl.onrender.com/api/participacion-temporada?temporada=${temporadaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setParticipaciones)
      .catch(err => {
        console.error('Error al cargar participaciones', err);
        setError('No se pudieron cargar las participaciones');
      });
  };

  const cargarEquipos = () => {
    fetch('https://overtime-ddyl.onrender.com/api/equipos', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setEquipos)
      .catch(err => {
        console.error('Error al cargar equipos', err);
        setError('No se pudieron cargar los equipos');
      });
  };

  const resetFormulario = () => {
    setEquipoSeleccionado('');
    setEstado('activo');
    setObservaciones('');
    setParticipacionEditando(null);
    setMostrarFormulario(false);
  };

  const enviarParticipacion = async () => {
    setMensaje('');
    setError('');

    if (!equipoSeleccionado || !temporadaId) {
      setError('Debe seleccionar un equipo y una temporada');
      return;
    }

    const url = 'https://overtime-ddyl.onrender.com/api/participacion-temporada' + (participacionEditando ? `/${participacionEditando._id}` : '');
    const metodo = participacionEditando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipo: equipoSeleccionado,
          temporada: temporadaId,
          estado,
          observaciones,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al guardar participación');

      setMensaje(participacionEditando ? 'Participación actualizada' : 'Participación creada');
      resetFormulario();
      cargarParticipaciones();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const eliminarParticipacion = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta participación?')) return;

    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-temporada/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error al eliminar participación');

      setMensaje('Participación eliminada');
      cargarParticipaciones();
    } catch (err) {
      console.error(err);
      setError('Error eliminando participación');
    }
  };

  const iniciarEdicion = (p) => {
    setParticipacionEditando(p);
    setEquipoSeleccionado(p.equipo?._id || p.equipo);
    setEstado(p.estado || 'activo');
    setObservaciones(p.observaciones || '');
    setMostrarFormulario(true);
    setMostrarJugadores(null);
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Participaciones de Temporada</h2>

      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Lista */}
      <ul className="mb-4 space-y-2">
        {participaciones.map((p) => (
          <li key={p._id} className="p-2 border rounded">
            <div className="flex justify-between items-center">
              <span>{p.equipo?.nombre || 'Equipo'} ({p.estado})</span>
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
                <SeccionJugadoresTemporada participacion={p} token={token} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Botón agregar */}
      {!mostrarFormulario && (
        <button
          onClick={() => {
            resetFormulario();
            setMostrarFormulario(true);
          }}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Agregar participación
        </button>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Equipo</label>
            <select
              className="w-full border p-2 rounded"
              value={equipoSeleccionado}
              onChange={(e) => setEquipoSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un equipo</option>
              {equipos.map((equipo) => (
                <option key={equipo._id} value={equipo._id}>
                  {equipo.nombre}
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
              <option value="expulsado">Expulsado</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Observaciones</label>
            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={enviarParticipacion}
            >
              {participacionEditando ? 'Actualizar' : 'Registrar'}
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
