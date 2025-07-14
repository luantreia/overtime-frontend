import React, { useState, useEffect } from 'react';
import ModalFaseAdmin from './AdminFase/ModalFaseAdmin';

const TIPOS = ['liga', 'grupo', 'eliminacion', 'amistoso'];

export default function SeccionFasesCompetencia({ competenciaId, token }) {
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [faseSeleccionada, setFaseSeleccionada] = useState(null); // ✅ NUEVO

  const [nuevaFase, setNuevaFase] = useState({
    nombre: '',
    tipo: 'liga',
    fechaInicio: '',
    fechaFin: '',
  });
  const [guardando, setGuardando] = useState(false);

  const cargarFases = async () => {
    if (!competenciaId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/fases?competencia=${competenciaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar fases');
      const data = await res.json();
      setFases(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFases();
  }, [competenciaId, token]);

  const eliminarFase = async (id) => {
    if (!window.confirm('¿Eliminar esta fase? Esta acción es irreversible.')) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/fases/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar fase');
      }
      await cargarFases();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaFase((prev) => ({ ...prev, [name]: value }));
  };

  const crearFase = async () => {
    if (!nuevaFase.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    setGuardando(true);
    try {
      const body = { ...nuevaFase, competencia: competenciaId };
      const res = await fetch('https://overtime-ddyl.onrender.com/api/fases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear fase');
      setNuevaFase({ nombre: '', tipo: 'liga', fechaInicio: '', fechaFin: '' });
      await cargarFases();
    } catch (e) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Fases de la Competencia</h3>

      {loading && <p>Cargando fases...</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {!loading && fases.length === 0 && <p className="text-gray-600 mb-2">No hay fases cargadas.</p>}

      {!loading && fases.length > 0 && (
        <ul className="mb-4 border rounded max-h-48 overflow-auto">
          {fases.map((fase) => (
            <li
              key={fase._id}
              className="flex justify-between items-center border-b px-2 py-1 last:border-b-0 hover:bg-gray-100 cursor-pointer"
              onClick={() => setFaseSeleccionada(fase._id)} // ✅ ABRIR MODAL
            >
              <div>
                <strong>{fase.nombre}</strong> ({fase.tipo})
                {fase.fechaInicio && <span> - Inicio: {new Date(fase.fechaInicio).toLocaleDateString()}</span>}
                {fase.fechaFin && <span> - Fin: {new Date(fase.fechaFin).toLocaleDateString()}</span>}
              </div>
              <button
                className="btn-danger text-xs"
                onClick={(e) => {
                  e.stopPropagation(); // ⛔ evitar que se abra el modal al hacer clic en "Eliminar"
                  eliminarFase(fase._id);
                }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border rounded p-4">
        <h4 className="font-semibold mb-2">Agregar nueva fase</h4>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1" htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={nuevaFase.nombre}
            onChange={handleChange}
            className="input w-full"
            placeholder="Nombre de la fase"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1" htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            value={nuevaFase.tipo}
            onChange={handleChange}
            className="input w-full"
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="mb-2 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" htmlFor="fechaInicio">Fecha Inicio</label>
            <input
              id="fechaInicio"
              name="fechaInicio"
              type="date"
              value={nuevaFase.fechaInicio}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" htmlFor="fechaFin">Fecha Fin</label>
            <input
              id="fechaFin"
              name="fechaFin"
              type="date"
              value={nuevaFase.fechaFin}
              onChange={handleChange}
              className="input w-full"
            />
          </div>
        </div>
        <button
          onClick={crearFase}
          disabled={guardando || !nuevaFase.nombre.trim()}
          className="btn-primary"
        >
          {guardando ? 'Guardando...' : 'Agregar Fase'}
        </button>
      </div>

      {faseSeleccionada && (
        <ModalFaseAdmin
          faseId={faseSeleccionada}
          token={token}
          onClose={() => {
            setFaseSeleccionada(null);
            cargarFases(); // recargar al cerrar el modal
          }}
        />
      )}
    </section>
  );
}
