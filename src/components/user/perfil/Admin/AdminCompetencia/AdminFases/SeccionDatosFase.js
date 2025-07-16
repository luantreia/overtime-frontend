import React, { useState, useEffect } from 'react';

const TIPOS = ['grupo', 'liga', 'playoff', 'promocion', 'otro'];

export default function SeccionDatosFase({ fase, setFase, temporadaId, token, onClose }) {
  const [editando, setEditando] = useState(!fase); // si no hay fase, arrancamos editando para crear
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (fase) {
      setFormData({
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
      setEditando(false);
    }
  }, [fase]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio.');
      return false;
    }
    if (formData.tipo === 'grupo') {
      if (!formData.numeroClasificados || Number(formData.numeroClasificados) <= 0) {
        alert('Debe ingresar un número válido de clasificados para tipo grupo.');
        return false;
      }
    }
    return true;
  };

  const guardarCambios = async () => {
    if (!validarFormulario()) return;

    try {
      setGuardando(true);
      const method = fase ? 'PUT' : 'POST';
      const url = fase
        ? `https://overtime-ddyl.onrender.com/api/fases/${fase._id}`
        : `https://overtime-ddyl.onrender.com/api/fases`;
      const body = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        orden: Number(formData.orden),
        descripcion: formData.descripcion.trim() || undefined,
        fechaInicio: formData.fechaInicio || undefined,
        fechaFin: formData.fechaFin || undefined,
        numeroClasificados: formData.tipo === 'grupo' ? Number(formData.numeroClasificados) : undefined,
        faseOrigenA:
          ['playoff', 'promocion'].includes(formData.tipo) && formData.faseOrigenA
            ? formData.faseOrigenA.trim()
            : undefined,
        faseOrigenB:
          ['playoff', 'promocion'].includes(formData.tipo) && formData.faseOrigenB
            ? formData.faseOrigenB.trim()
            : undefined,
        temporada: temporadaId,
      };
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
      setFase(result);
      setEditando(false);
      alert(fase ? 'Fase actualizada' : 'Fase creada');
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
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/fases/${fase._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar fase');
      alert('Fase eliminada');
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Datos de la fase</h3>
        {editando ? (
          <div className="space-x-2">
            <button
              className="btn-primary"
              onClick={guardarCambios}
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setEditando(false);
                if (fase) {
                  setFormData({
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
                } else {
                  setFormData({
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
                }
              }}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => setEditando(true)}>Editar</button>
        )}
      </div>

      {!editando ? (
        <ul className="mt-2 space-y-1">
          <li><strong>Nombre:</strong> {fase?.nombre || '-'}</li>
          <li><strong>Tipo:</strong> {fase?.tipo || '-'}</li>
          <li><strong>Orden:</strong> {fase?.orden ?? '-'}</li>
          {fase?.tipo === 'grupo' && (
            <li><strong>Número de clasificados:</strong> {fase.numeroClasificados ?? '-'}</li>
          )}
          {['playoff', 'promocion'].includes(fase?.tipo) && (
            <>
              <li><strong>Fase Origen A:</strong> {fase.faseOrigenA || '-'}</li>
              <li><strong>Fase Origen B:</strong> {fase.faseOrigenB || '-'}</li>
            </>
          )}
          <li><strong>Fecha Inicio:</strong> {fase?.fechaInicio?.slice(0, 10) || '-'}</li>
          <li><strong>Fecha Fin:</strong> {fase?.fechaFin?.slice(0, 10) || '-'}</li>
          <li><strong>Descripción:</strong> {fase?.descripcion || '-'}</li>
        </ul>
      ) : (
        <div className="space-y-4 mt-2">
          <div>
            <label className="block mb-1 font-medium">Nombre *</label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleInput}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tipo *</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInput}
              className="select select-bordered w-full"
            >
              {TIPOS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Orden *</label>
            <input
              name="orden"
              type="number"
              value={formData.orden}
              onChange={handleInput}
              className="input input-bordered w-full"
            />
          </div>

          {formData.tipo === 'grupo' && (
            <div>
              <label className="block mb-1 font-medium">Número de clasificados *</label>
              <input
                name="numeroClasificados"
                type="number"
                value={formData.numeroClasificados}
                onChange={handleInput}
                className="input input-bordered w-full"
              />
            </div>
          )}

          {['playoff', 'promocion'].includes(formData.tipo) && (
            <>
              <div>
                <label className="block mb-1 font-medium">Fase Origen A (ID)</label>
                <input
                  name="faseOrigenA"
                  value={formData.faseOrigenA}
                  onChange={handleInput}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Fase Origen B (ID)</label>
                <input
                  name="faseOrigenB"
                  value={formData.faseOrigenB}
                  onChange={handleInput}
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
                value={formData.fechaInicio}
                onChange={handleInput}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Fecha Fin</label>
              <input
                name="fechaFin"
                type="date"
                value={formData.fechaFin}
                onChange={handleInput}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInput}
              className="textarea textarea-bordered w-full"
            />
          </div>

          <div className="mt-4">
            {fase && (
              <button
                className="btn btn-error"
                onClick={eliminarFase}
                disabled={eliminando}
              >
                {eliminando ? 'Eliminando...' : 'Eliminar fase'}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
