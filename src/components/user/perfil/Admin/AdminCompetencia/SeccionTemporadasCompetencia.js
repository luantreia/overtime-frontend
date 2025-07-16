import React, { useEffect, useState } from 'react';
import ModalTemporadaAdmin from './AdminTemporadas/ModalTemporadaAdmin';

export default function SeccionTemporadasCompetencia({ competenciaId, token }) {
  const [temporadas, setTemporadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [temporadaSeleccionada, setTemporadaSeleccionada] = useState(null);
  // Formulario creación / edición
  const [form, setForm] = useState({
    id: null, // para editar
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
  });
  const [cargandoForm, setCargandoForm] = useState(false);
  const [editando, setEditando] = useState(false);

  // Cargar temporadas
  const cargarTemporadas = async () => {
    if (!competenciaId) return;
    setLoading(true);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/temporadas?competencia=${competenciaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar temporadas');
      const data = await res.json();
      setTemporadas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTemporadas();
  }, [competenciaId]);

  // Cambios en formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Iniciar edición
  const editarTemporada = (temp) => {
    setForm({
      id: temp._id,
      nombre: temp.nombre || '',
      descripcion: temp.descripcion || '',
      fechaInicio: temp.fechaInicio ? temp.fechaInicio.slice(0, 10) : '',
      fechaFin: temp.fechaFin ? temp.fechaFin.slice(0, 10) : '',
    });
    setEditando(true);
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setForm({
      id: null,
      nombre: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
    });
    setEditando(false);
  };

  // Enviar formulario (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!form.nombre) {
      alert('Nombre es obligatorio');
      return;
    }

    const url = form.id
      ? `https://overtime-ddyl.onrender.com/api/temporadas/${form.id}`
      : 'https://overtime-ddyl.onrender.com/api/temporadas';

    const method = form.id ? 'PUT' : 'POST';

    const body = {
      competencia: competenciaId,
      nombre: form.nombre,
      descripcion: form.descripcion,
      fechaInicio: form.fechaInicio || undefined,
      fechaFin: form.fechaFin || undefined,
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
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al guardar temporada');
      }
      await cargarTemporadas();
      cancelarEdicion();
    } catch (err) {
      alert(err.message);
    } finally {
      setCargandoForm(false);
    }
  };

  // Render
  if (loading) return <p>Cargando temporadas...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Temporadas</h3>
      {!mostrarFormulario && (
        <button className="btn btn-primary mb-4" onClick={() => setMostrarFormulario(true)}>
          Crear temporada
        </button>
      )}
      {/* Listado */}
      <ul className="mb-6">
        {temporadas.length === 0 && <li>No hay temporadas cargadas.</li>}
        {temporadas.map(temp => (
          <li key={temp._id} className="border rounded p-2 mb-2 flex justify-between items-center">
            <div>
              <strong>{temp.nombre}</strong><br />
              <small>{temp.descripcion || '-'}</small>
            </div>
            <button
              className="btn btn-sm btn-accent ml-2"
              onClick={() => setTemporadaSeleccionada(temp)}
            >
              Ver
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => editarTemporada(temp)}
            >
              Editar
            </button>
          </li>
        ))}
      </ul>

      {/* Formulario creación/edición */}
      {(mostrarFormulario || editando) && (
      <form onSubmit={handleSubmit} className="border p-4 rounded bg-gray-50 space-y-4">
        <h4 className="font-semibold">{editando ? 'Editar Temporada' : 'Nueva Temporada'}</h4>

        <div>
          <label className="block mb-1 font-medium" htmlFor="nombre">Nombre *</label>
          <input
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium" htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="fechaInicio">Fecha Inicio</label>
            <input
              id="fechaInicio"
              name="fechaInicio"
              type="date"
              value={form.fechaInicio}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="fechaFin">Fecha Fin</label>
            <input
              id="fechaFin"
              name="fechaFin"
              type="date"
              value={form.fechaFin}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={cargandoForm}
          >
            {cargandoForm ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear')}
          </button>

          {editando && (
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={cancelarEdicion}
              disabled={cargandoForm}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      )}

      {temporadaSeleccionada && (
        <ModalTemporadaAdmin
          competenciaId={competenciaId}
          temporada={temporadaSeleccionada}
          onClose={() => setTemporadaSeleccionada(null)}
          token={token}
        />
      )}
    </section>
  );
}
