import React, { useState } from 'react';

const estados = ['programada', 'en_curso', 'finalizada', 'cancelada', 'en_creacion'];
const tipos = ['liga', 'torneo', 'otro'];

export default function SeccionDatosCompetencia({ competencia, token, onUpdate }) {
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: competencia.nombre || '',
    estado: competencia.estado || 'en_creacion',
    tipo: competencia.tipo || 'otro',
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const guardarCambios = async () => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competencia._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al guardar cambios');
      const actualizado = await res.json();
      onUpdate(actualizado);
      setEditando(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Datos de la competencia</h3>
        {editando ? (
          <div className="space-x-2">
            <button className="btn-primary" onClick={guardarCambios}>Guardar</button>
            <button className="btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={() => setEditando(true)}>Editar</button>
        )}
      </div>
      {!editando ? (
        <ul className="mt-2 space-y-1">
          <li><strong>Nombre:</strong> {competencia.nombre}</li>
          <li><strong>Estado:</strong> {competencia.estado || '-'}</li>
          <li><strong>Tipo:</strong> {competencia.tipo || '-'}</li>
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="font-medium capitalize">Nombre</label>
            <input className="input" name="nombre" value={formData.nombre} onChange={handleInput} />
          </div>
          <div>
            <label className="font-medium capitalize">Estado</label>
            <select name="estado" value={formData.estado} onChange={handleInput} className="input">
              {estados.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-medium capitalize">Tipo</label>
            <select name="tipo" value={formData.tipo} onChange={handleInput} className="input">
              {tipos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
