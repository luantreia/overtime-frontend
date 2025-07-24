import React, { useState, useEffect } from 'react';
import SeccionJugadoresTemporada from './SeccionJugadoresTemporada';

export default function SeccionParticipacionTemporada({ temporadaId, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState([]);
  const [estado, setEstado] = useState('activo');
  const [observaciones, setObservaciones] = useState('');
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
    setEquiposSeleccionados([]);
    setEstado('activo');
    setObservaciones('');
    setMostrarFormulario(false);
  };

  const toggleSeleccion = (equipoId) => {
    setEquiposSeleccionados((prev) =>
      prev.includes(equipoId)
        ? prev.filter((id) => id !== equipoId)
        : [...prev, equipoId]
    );
  };

  const enviarParticipaciones = async () => {
    setMensaje('');
    setError('');

    if (equiposSeleccionados.length === 0 || !temporadaId) {
      setError('Debe seleccionar al menos un equipo');
      return;
    }

    let errores = [];
    for (const equipoId of equiposSeleccionados) {
      try {
        const res = await fetch('https://overtime-ddyl.onrender.com/api/participacion-temporada', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            equipo: equipoId,
            temporada: temporadaId,
            estado,
            observaciones,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          errores.push(`${equipoId}: ${data.message || 'error'}`);
        }
      } catch (err) {
        errores.push(`${equipoId}: ${err.message}`);
      }
    }

    if (errores.length) {
      setError('Algunos equipos no se pudieron registrar:\n' + errores.join('\n'));
    } else {
      setMensaje('Participaciones registradas correctamente');
    }

    resetFormulario();
    cargarParticipaciones();
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

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Participaciones de Temporada</h2>

      {mensaje && <div className="text-green-600 mb-2 whitespace-pre-wrap">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2 whitespace-pre-wrap">{error}</div>}

      <ul className="mb-4 space-y-2">
        {participaciones.map((p) => (
          <li key={p._id} className="p-2 border rounded">
            <div className="flex justify-between items-center">
              <span>{p.equipo?.nombre || 'Equipo'} ({p.estado})</span>
              <div className="flex gap-2">
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
          Agregar equipos a la temporada
        </button>
      )}

      {/* Formulario múltiple */}
      {mostrarFormulario && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <label className="block font-medium mb-1">Seleccione uno o más equipos</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border p-2 rounded">
              {equipos.map((equipo) => (
                <label key={equipo._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={equiposSeleccionados.includes(equipo._id)}
                    onChange={() => toggleSeleccion(equipo._id)}
                  />
                  {equipo.nombre}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Estado</label>
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
            <label className="block font-medium mb-1">Observaciones</label>
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
              onClick={enviarParticipaciones}
            >
              Registrar participaciones
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
