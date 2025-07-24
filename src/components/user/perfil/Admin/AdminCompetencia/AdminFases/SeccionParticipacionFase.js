import React, { useEffect, useState } from 'react';
import SeccionJugadoresFase from './SeccionJugadoresFase';

export default function SeccionParticipacionFase({ faseId, temporadaId, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [participacionesTemporada, setParticipacionesTemporada] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ grupo: '', division: '', puntos: 0 });
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [jugadoresAbiertosId, setJugadoresAbiertosId] = useState(null);

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
      if (!res.ok) throw new Error('Error cargando participaciones en fase');
      const data = await res.json();
      setParticipaciones(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const cargarParticipacionesTemporada = async () => {
    try {
      setError('');
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-temporada?temporada=${temporadaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error cargando participaciones de temporada');
      const data = await res.json();
      setParticipacionesTemporada(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetFormulario = () => {
    setForm({ grupo: '', division: '', puntos: 0 });
    setSeleccionados([]);
    setFormVisible(false);
    setJugadoresAbiertosId(null);
    setMensaje('');
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === 'puntos' ? Number(value) : value,
    }));
  };

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const enviarParticipacionesMultiples = async () => {
    if (seleccionados.length === 0) {
      setError('Debe seleccionar al menos un equipo');
      return;
    }

    setError('');
    setMensaje('');

    const solicitudes = seleccionados.map((participacionTemporadaId) =>
      fetch(`https://overtime-ddyl.onrender.com/api/participacion-fase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fase: faseId,
          participacionTemporada: participacionTemporadaId,
          grupo: form.grupo || null,
          division: form.division || null,
          puntos: form.puntos || 0,
        }),
      })
    );

    try {
      const resultados = await Promise.all(solicitudes);
      const errores = [];

      for (let res of resultados) {
        const data = await res.json();
        if (!res.ok) errores.push(data.message || 'Error desconocido');
      }

      if (errores.length) {
        setError('Algunas participaciones no se pudieron registrar:\n' + errores.join('\n'));
      } else {
        setMensaje('Participaciones registradas con éxito');
        resetFormulario();
        cargarParticipacionesFase();
      }
    } catch (err) {
      setError('Error al registrar participaciones');
    }
  };

  const eliminarParticipacion = async (id) => {
    if (!window.confirm('¿Eliminar esta participación?')) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-fase/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar participación');
      setMensaje('Participación eliminada');
      cargarParticipacionesFase();
      if (jugadoresAbiertosId === id) setJugadoresAbiertosId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleJugadores = (id) => {
    setJugadoresAbiertosId((prev) => (prev === id ? null : id));
  };

  const participacionesRegistradas = participaciones.map((p) => p.participacionTemporada?._id);
  const disponibles = participacionesTemporada.filter(
    (pt) => !participacionesRegistradas.includes(pt._id)
  );

  return (
    <section className="p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-5">Participaciones en Fase</h2>

      {mensaje && <p className="mb-3 text-green-600 font-medium whitespace-pre-line">{mensaje}</p>}
      {error && <p className="mb-3 text-red-600 font-medium whitespace-pre-line">{error}</p>}

      {/* Lista participaciones */}
      <ul className="space-y-3 mb-6">
        {participaciones.map((p) => (
          <li
            key={p._id}
            className="p-4 border rounded cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => toggleJugadores(p._id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">
                  {p.participacionTemporada?.equipo?.nombre || 'Equipo sin nombre'}
                </p>
                <p className="text-sm text-gray-600">
                  Grupo: <span className="font-medium">{p.grupo || '-'}</span> | División:{' '}
                  <span className="font-medium">{p.division || '-'}</span> | Puntos:{' '}
                  <span className="font-medium">{p.puntos ?? 0}</span>
                </p>
              </div>
              <button
                className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  eliminarParticipacion(p._id);
                }}
              >
                Eliminar
              </button>
            </div>

            {jugadoresAbiertosId === p._id && (
              <div className="mt-4 border-t pt-4">
                <SeccionJugadoresFase participacion={p} token={token} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Botón para abrir formulario */}
      {!formVisible && (
        <button
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => setFormVisible(true)}
        >
          Registrar Participaciones
        </button>
      )}

      {/* Formulario de registro múltiple */}
      {formVisible && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarParticipacionesMultiples();
          }}
          className="border-t pt-6 space-y-4 max-w-xl"
        >
          <fieldset>
            <legend className="font-medium mb-2">Seleccionar equipos:</legend>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-auto border p-2 rounded">
              {disponibles.map((pt) => (
                <label key={pt._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(pt._id)}
                    onChange={() => toggleSeleccion(pt._id)}
                  />
                  {pt.equipo?.nombre || 'Sin nombre'} ({pt.estado})
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="block font-medium mb-1">Grupo</label>
            <input
              name="grupo"
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.grupo}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">División</label>
            <input
              name="division"
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.division}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Puntos</label>
            <input
              name="puntos"
              type="number"
              min={0}
              className="w-full border rounded px-3 py-2"
              value={form.puntos}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-grow bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded"
            >
              Registrar
            </button>
            <button
              type="button"
              onClick={resetFormulario}
              className="flex-grow bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
