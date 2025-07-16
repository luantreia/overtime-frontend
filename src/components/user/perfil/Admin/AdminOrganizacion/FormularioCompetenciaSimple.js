import React, { useState } from 'react';

export default function FormularioCompetenciaAvanzado({ organizacionId, token, onCreada }) {
  const [form, setForm] = useState({
    modalidad: 'Foam',
    categoria: 'Masculino',
    tipo: 'liga',
    temporada: '2025',
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    foto: '',
  });

  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fechaInicio) {
      alert('Debe ingresar la fecha de inicio');
      return;
    }

    const datosParaEnviar = {
      ...form,
      organizacion: organizacionId,
    };

    try {
      setCargando(true);

      const res = await fetch('https://overtime-ddyl.onrender.com/api/competencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosParaEnviar),
      });

      const data = await res.json();

      if (res.ok) {
        onCreada(data);
        setForm({
          modalidad: 'Foam',
          categoria: 'Masculino',
          tipo: 'liga',
          fechaInicio: '',
          fechaFin: '',
          descripcion: '',
          foto: '',
        });
      } else {
        alert(data.error || 'Error al crear competencia');
      }
    } catch (err) {
      alert('Error de red');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded bg-gray-50 mb-4 space-y-4">
      <h4 className="font-semibold text-gray-700">Nueva competencia</h4>

      {/* Modalidad */}
      <div className="flex gap-2">
        {['Foam', 'Cloth'].map((m) => (
          <label key={m} className="flex items-center gap-1">
            <input
              type="radio"
              name="modalidad"
              value={m}
              checked={form.modalidad === m}
              onChange={handleChange}
            />
            {m}
          </label>
        ))}
      </div>

      {/* Categoría */}
      <div className="flex gap-2">
        {['Masculino', 'Femenino', 'Mixto', 'Libre'].map((c) => (
          <label key={c} className="flex items-center gap-1">
            <input
              type="radio"
              name="categoria"
              value={c}
              checked={form.categoria === c}
              onChange={handleChange}
            />
            {c}
          </label>
        ))}
      </div>

      {/* Tipo */}
      <div className="flex gap-2">
        {['liga', 'torneo', 'otro'].map((t) => (
          <label key={t} className="flex items-center gap-1">
            <input
              type="radio"
              name="tipo"
              value={t}
              checked={form.tipo === t}
              onChange={handleChange}
            />
            {t}
          </label>
        ))}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="date"
          name="fechaInicio"
          value={form.fechaInicio}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
        <input
          type="date"
          name="fechaFin"
          value={form.fechaFin}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>

      {/* Descripción */}
      <textarea
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        placeholder="Descripción (opcional)"
        className="textarea textarea-bordered w-full"
      />

      {/* Foto */}
      <input
        type="text"
        name="foto"
        value={form.foto}
        onChange={handleChange}
        placeholder="URL de la imagen (opcional)"
        className="input input-bordered w-full"
      />

      {/* Botón crear */}
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={cargando}
      >
        {cargando ? 'Creando...' : 'Crear competencia'}
      </button>
    </form>
  );
}
