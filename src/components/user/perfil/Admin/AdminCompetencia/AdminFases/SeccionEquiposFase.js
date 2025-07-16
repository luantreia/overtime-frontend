import React, { useEffect, useState } from 'react';

export default function SeccionEquiposFase({ faseId, temporadaId, token }) {
  const [participaciones, setParticipaciones] = useState([]);
  const [equiposTemporada, setEquiposTemporada] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(false);

  const [form, setForm] = useState({
    id: null,
    participacionTemporada: '',
    grupo: '',
    division: '',
  });

  const [guardando, setGuardando] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (faseId && temporadaId) {
      cargarParticipaciones();
      cargarEquiposTemporada();
    }
  }, [faseId, temporadaId]);

  const cargarParticipaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/participacion-fase?fase=${faseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setParticipaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar participaciones');
    } finally {
      setLoading(false);
    }
  };

  const cargarEquiposTemporada = async () => {
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/participacion-temporada?temporada=${temporadaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setEquiposTemporada(data);
    } catch (err) {
      setError('Error al cargar equipos');
    }
  };

  // --- FORMULARIO ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const cancelarEdicion = () => {
    setForm({ id: null, participacionTemporada: '', grupo: '', division: '' });
    setEditando(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.participacionTemporada) {
      alert('Debe seleccionar un equipo');
      return;
    }

    const url = form.id
      ? `https://overtime-ddyl.onrender.com/api/participacion-fase/${form.id}`
      : `https://overtime-ddyl.onrender.com/api/participacion-fase`;

    const method = form.id ? 'PUT' : 'POST';

    const body = {
      participacionTemporada: form.participacionTemporada,
      fase: faseId,
      grupo: form.grupo || undefined,
      division: form.division || undefined,
    };

    try {
      setGuardando(true);
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar participación');

      await cargarParticipaciones();
      cancelarEdicion();
    } catch (err) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const editarParticipacion = (p) => {
    setForm({
      id: p._id,
      participacionTemporada: p.participacionTemporada?._id || '',
      grupo: p.grupo || '',
      division: p.division || '',
    });
    setEditando(true);
  };

  const eliminarParticipacion = async (id) => {
    if (!window.confirm('¿Eliminar participación?')) return;
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/participacion-fase/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Error al eliminar participación');
      await cargarParticipaciones();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- RENDER ---
  if (loading) return <p>Cargando equipos participantes...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Equipos Participantes</h3>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="border p-4 rounded bg-gray-50 space-y-4 mb-6"
      >
        <div>
          <label className="block mb-1 font-medium">Equipo Temporada *</label>
          <select
            name="participacionTemporada"
            value={form.participacionTemporada}
            onChange={handleChange}
            className="select select-bordered w-full"
            required
          >
            <option value="">Seleccionar...</option>
            {equiposTemporada.map((e) => (
              <option key={e._id} value={e._id}>
                {e.equipoCompetencia?.equipo?.nombre || 'Sin nombre'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Grupo</label>
          <input
            name="grupo"
            value={form.grupo}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">División</label>
          <input
            name="division"
            value={form.division}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar'}
          </button>
          {editando && (
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={cancelarEdicion}
              disabled={guardando}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      <ul className="space-y-2">
        {participaciones.length === 0 ? (
          <li>No hay equipos participando aún.</li>
        ) : (
          participaciones.map((p) => (
            <li
              key={p._id}
              className="border rounded p-2 flex justify-between items-center"
            >
              <div>
                <strong>
                  {p.participacionTemporada?.equipoCompetencia?.equipo?.nombre ||
                    'Sin nombre'}
                </strong>
                <br />
                <small>Grupo: {p.grupo || '-'}</small>{' '}
                <small>División: {p.division || '-'}</small>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => editarParticipacion(p)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => eliminarParticipacion(p._id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
