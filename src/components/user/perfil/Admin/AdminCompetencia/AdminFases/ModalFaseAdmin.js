import React, { useEffect, useState } from 'react';
import ModalBase from '../../ModalBase';
import SeccionEquiposFase from './SeccionEquiposFase'; // Asegurate de ajustar el path si es necesario

const TIPOS = ['grupo', 'liga', 'playoff', 'promocion', 'otro'];

export default function ModalFaseAdmin({ fase, temporadaId, token, onClose }) {
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'grupo',
    orden: 0,
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    numeroClasificados: '',
    faseOrigenA: '',
    faseOrigenB: '',
  });

  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [faseGuardadaId, setFaseGuardadaId] = useState(fase?._id || null);

  useEffect(() => {
    if (fase) {
      setForm({
        nombre: fase.nombre || '',
        tipo: fase.tipo || 'grupo',
        orden: fase.orden ?? 0,
        descripcion: fase.descripcion || '',
        fechaInicio: fase.fechaInicio?.slice(0, 10) || '',
        fechaFin: fase.fechaFin?.slice(0, 10) || '',
        numeroClasificados: fase.numeroClasificados ?? '',
        faseOrigenA: fase.faseOrigenA || '',
        faseOrigenB: fase.faseOrigenB || '',
      });
    }
  }, [fase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) {
      alert('El nombre es obligatorio.');
      return false;
    }
    if (form.tipo === 'grupo') {
      if (!form.numeroClasificados || Number(form.numeroClasificados) <= 0) {
        alert('Debe ingresar un número válido de clasificados para tipo grupo.');
        return false;
      }
    }
    return true;
  };

  const armarBody = () => {
    return {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      orden: Number(form.orden),
      descripcion: form.descripcion.trim() || undefined,
      fechaInicio: form.fechaInicio || undefined,
      fechaFin: form.fechaFin || undefined,
      numeroClasificados: form.tipo === 'grupo' ? Number(form.numeroClasificados) : undefined,
      faseOrigenA:
        ['playoff', 'promocion'].includes(form.tipo) && form.faseOrigenA
          ? form.faseOrigenA.trim()
          : undefined,
      faseOrigenB:
        ['playoff', 'promocion'].includes(form.tipo) && form.faseOrigenB
          ? form.faseOrigenB.trim()
          : undefined,
      temporada: temporadaId,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const body = armarBody();

    try {
      setGuardando(true);
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/fases/${fase?._id || ''}`,
        {
          method: fase ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al guardar fase');

      setFaseGuardadaId(result._id || fase?._id); // aseguramos el ID para uso posterior
      if (!fase) alert('Fase creada. Ahora puedes agregar equipos.');
    } catch (error) {
      alert(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarFase = async () => {
    if (!fase?._id) return;
    if (!window.confirm('¿Estás seguro que deseas eliminar esta fase?')) return;

    try {
      setEliminando(true);
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/fases/${fase._id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Error al eliminar fase');
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <ModalBase
      open={true}
      onClose={onClose}
      title={fase ? `Editar Fase: ${fase.nombre}` : 'Nueva Fase'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Orden *</label>
          <input
            name="orden"
            type="number"
            value={form.orden}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        {form.tipo === 'grupo' && (
          <div>
            <label className="block mb-1 font-medium">Número de clasificados *</label>
            <input
              name="numeroClasificados"
              type="number"
              value={form.numeroClasificados}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
        )}

        {['playoff', 'promocion'].includes(form.tipo) && (
          <>
            <div>
              <label className="block mb-1 font-medium">Fase Origen A (ID)</label>
              <input
                name="faseOrigenA"
                value={form.faseOrigenA}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Fase Origen B (ID)</label>
              <input
                name="faseOrigenB"
                value={form.faseOrigenB}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Fecha Inicio</label>
            <input
              name="fechaInicio"
              type="date"
              value={form.fechaInicio}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Fecha Fin</label>
            <input
              name="fechaFin"
              type="date"
              value={form.fechaFin}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
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

        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          {fase && (
            <button
              type="button"
              className="btn btn-error"
              onClick={eliminarFase}
              disabled={eliminando}
            >
              {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
        </div>
      </form>

      {/* Mostrar sección de equipos si la fase ya tiene ID */}
      {faseGuardadaId && (
        <div className="mt-6 border-t pt-4">
          <SeccionEquiposFase
            faseId={faseGuardadaId}
            temporadaId={temporadaId}
            token={token}
          />
        </div>
      )}
    </ModalBase>
  );
}
