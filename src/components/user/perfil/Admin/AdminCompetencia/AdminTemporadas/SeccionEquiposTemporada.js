import React, { useEffect, useState } from 'react';

export default function SeccionEquiposTemporada({ competenciaId, temporada, temporadaId, token }) {
    const [competencia, setCompetencia] = useState(null);
    const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: null,
    equipoCompetencia: '',
    desde: '',
    hasta: '',
    estado: 'activo',
    observaciones: '',
  });
  const [editando, setEditando] = useState(false);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [equiposDisponibles, setEquiposDisponibles] = useState([]);

  const cargarParticipaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/participacion-temporada?temporada=${temporadaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setParticipaciones(data);
    } catch (e) {
      console.error('Error al cargar participaciones', e);
    } finally {
      setLoading(false);
    }
  };

    const cargarEquiposDisponibles = async () => {
    try {
        if (!temporada?.competencia) return; // Asegurate que temporada tenga competencia asociada

        const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/equipos-competencia?competencia=${temporada.competencia}`,
        { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setEquiposDisponibles(data);
    } catch (e) {
        console.error('Error al cargar equipos', e);
    }
    };

  useEffect(() => {
    if (temporadaId) {
      cargarParticipaciones();
      cargarEquiposDisponibles();
    }
  }, [temporadaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const editar = (p) => {
    setForm({
      id: p._id,
      equipoCompetencia: p.equipoCompetencia._id,
      desde: p.desde?.slice(0, 10) || '',
      hasta: p.hasta?.slice(0, 10) || '',
      estado: p.estado,
      observaciones: p.observaciones || '',
    });
    setEditando(true);
  };

  const cancelar = () => {
    setEditando(false);
    setForm({
      id: null,
      equipoCompetencia: '',
      desde: '',
      hasta: '',
      estado: 'activo',
      observaciones: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipoCompetencia) {
      alert('Debés seleccionar un equipo');
      return;
    }

    const url = form.id
      ? `https://overtime-ddyl.onrender.com/api/participacion-temporada/${form.id}`
      : `https://overtime-ddyl.onrender.com/api/participacion-temporada`;

    const method = form.id ? 'PUT' : 'POST';
    const body = {
      equipoCompetencia: form.equipoCompetencia,
      temporada: temporadaId,
      desde: form.desde || undefined,
      hasta: form.hasta || undefined,
      estado: form.estado,
      observaciones: form.observaciones,
    };

    try {
      setCargandoForm(true);
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await cargarParticipaciones();
      cancelar();
    } catch (err) {
      alert(err.message);
    } finally {
      setCargandoForm(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar participación?')) return;
    try {
      await fetch(
        `https://overtime-ddyl.onrender.com/api/participacion-temporada/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await cargarParticipaciones();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  return (
    <section className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Participación de Equipos</h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded mb-6">
        <div>
          <label className="block font-medium mb-1">Equipo Competencia</label>
          <select
            name="equipoCompetencia"
            value={form.equipoCompetencia}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="">Seleccionar...</option>
            {equiposDisponibles.map((e) => (
              <option key={e._id} value={e._id}>
                {e.nombre || e.equipo?.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="activo">Activo</option>
            <option value="baja">Baja</option>
            <option value="expulsado">Expulsado</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Desde</label>
          <input
            type="date"
            name="desde"
            value={form.desde}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Hasta</label>
          <input
            type="date"
            name="hasta"
            value={form.hasta}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="col-span-full">
          <label className="block font-medium mb-1">Observaciones</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div className="col-span-full flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={cargandoForm}>
            {editando ? 'Actualizar' : 'Agregar'}
          </button>
          {editando && (
            <button type="button" className="btn" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul className="space-y-2">
          {participaciones.length === 0 && <li>No hay participaciones aún.</li>}
          {participaciones.map((p) => (
            <li
              key={p._id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <strong>{p.equipoCompetencia?.nombre || p.equipoCompetencia?.equipo?.nombre}</strong>{' '}
                <small className="text-gray-500">({p.estado})</small>
                <br />
                <small className="text-gray-500">
                  {p.desde?.slice(0, 10)} - {p.hasta?.slice(0, 10)}
                </small>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-outline" onClick={() => editar(p)}>
                  Editar
                </button>
                <button className="btn btn-sm btn-error" onClick={() => eliminar(p._id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
