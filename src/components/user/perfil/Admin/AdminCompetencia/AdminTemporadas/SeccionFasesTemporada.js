import React, { useEffect, useState } from 'react';
import ModalFaseAdmin from '../AdminFases/ModalFaseAdmin';

export default function SeccionFasesTemporada({ temporadaId, token }) {
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [faseSeleccionada, setFaseSeleccionada] = useState(null);

  const [form, setForm] = useState({
    id: null,
    nombre: '',
    tipo: 'grupo',
    orden: 0,
    descripcion: '',
  });

  const [editando, setEditando] = useState(false);
  const [cargandoForm, setCargandoForm] = useState(false);

  const tipos = ['grupo', 'liga', 'playoff', 'promocion', 'otro'];

  // --- Cargar fases ---
  const cargarFases = async () => {
    if (!temporadaId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/fases?temporada=${temporadaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Error al cargar fases');
      const data = await res.json();
      setFases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('temporadaId recibido en SeccionFasesTemporada:', temporadaId);
    cargarFases();
    
  }, [temporadaId]);

  // --- Form handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const editarFase = (fase) => {
    setForm({
      id: fase._id,
      nombre: fase.nombre || '',
      tipo: fase.tipo || 'grupo',
      orden: fase.orden || 0,
      descripcion: fase.descripcion || '',
    });
    setEditando(true);
    setMostrarFormulario(true);
  };

  const cancelarEdicion = () => {
    setForm({
      id: null,
      nombre: '',
      tipo: 'grupo',
      orden: 0,
      descripcion: '',
    });
    setEditando(false);
    setMostrarFormulario(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre) {
      alert('Nombre es obligatorio');
      return;
    }

    const url = form.id
      ? `https://overtime-ddyl.onrender.com/api/fases/${form.id}`
      : 'https://overtime-ddyl.onrender.com/api/fases';

    const method = form.id ? 'PUT' : 'POST';

    const body = {
      temporada: temporadaId,
      nombre: form.nombre,
      tipo: form.tipo,
      orden: Number(form.orden),
      descripcion: form.descripcion,
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

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al guardar fase');

      await cargarFases();
      cancelarEdicion();
    } catch (err) {
      alert(err.message);
    } finally {
      setCargandoForm(false);
    }
  };

  // --- Render ---
  if (loading) return <p>Cargando fases...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Fases</h3>

      {!mostrarFormulario && (
        <button className="btn btn-primary mb-4" onClick={() => setMostrarFormulario(true)}>
          Crear fase
        </button>
      )}

      <ul className="mb-6">
        {fases.length === 0 && <li>No hay fases registradas.</li>}
        {fases.map((fase) => (
          <li key={fase._id} className="border rounded p-2 mb-2 flex justify-between items-center">
            <div>
              <strong>{fase.nombre}</strong> <br />
              <small>{fase.tipo}</small>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-accent" onClick={() => setFaseSeleccionada(fase)}>
                Ver
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => editarFase(fase)}>
                Editar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {(mostrarFormulario || editando) && (
        <form onSubmit={handleSubmit} className="border p-4 rounded bg-gray-50 space-y-4">
          <h4 className="font-semibold">{editando ? 'Editar Fase' : 'Nueva Fase'}</h4>

          <div>
            <label className="block mb-1 font-medium">Nombre *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tipo *</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Orden *</label>
            <input
              type="number"
              name="orden"
              value={form.orden}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1" disabled={cargandoForm}>
              {cargandoForm ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
            </button>
            {editando && (
              <button type="button" className="btn btn-secondary flex-1" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {/* Modal de administración avanzada */}
      {faseSeleccionada && (
        <ModalFaseAdmin
          fase={faseSeleccionada}
          temporadaId={temporadaId}
          token={token}
          onClose={() => setFaseSeleccionada(null)}
        />
      )}
    </section>
  );
}
