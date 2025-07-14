// src/components/admin/competencia/fase/SeccionDatosFase.js
import React, { useState } from 'react';

export default function SeccionDatosFase({ fase, token, onUpdate }) {
  const [form, setForm] = useState({ nombre: fase.nombre || '', tipo: fase.tipo || '', fechaInicio: fase.fechaInicio?.slice(0, 10) || '', fechaFin: fase.fechaFin?.slice(0, 10) || '' });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/fases/${fase._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar');
      onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Datos de la Fase</h3>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input className="input" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
        <select className="input" name="tipo" value={form.tipo} onChange={handleChange}>
          <option value="liga">Liga</option>
          <option value="grupo">Grupo</option>
          <option value="eliminacion">Eliminación</option>
          <option value="amistoso">Amistoso</option>
        </select>
        <input type="date" className="input" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} />
        <input type="date" className="input" name="fechaFin" value={form.fechaFin} onChange={handleChange} />
      </div>
      <button className="btn-primary mt-3" onClick={handleSubmit} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </section>
  );
}
