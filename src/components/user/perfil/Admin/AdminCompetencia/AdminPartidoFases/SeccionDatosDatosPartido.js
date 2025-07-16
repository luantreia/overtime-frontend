import React, { useEffect, useState } from 'react';

export default function SeccionDatosPartido({
  partido,
  faseId,
  participantes,
  token,
  onGuardar,
}) {
  const editando = !!partido;
  const [form, setForm] = useState({
    fecha: '',
    ubicacion: '',
    participacionFaseLocal: '',
    participacionFaseVisitante: '',
    estado: 'programado',
    marcadorLocal: 0,
    marcadorVisitante: 0,
  });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (editando && partido) {
      setForm({
        fecha: formatearFechaInput(partido.fecha),
        ubicacion: partido.ubicacion || '',
        participacionFaseLocal: partido.participacionFaseLocal?._id || '',
        participacionFaseVisitante: partido.participacionFaseVisitante?._id || '',
        estado: partido.estado || 'programado',
        marcadorLocal: partido.marcadorLocal || 0,
        marcadorVisitante: partido.marcadorVisitante || 0,
      });
    }
  }, [partido]);

  const apiBase = 'https://overtime-ddyl.onrender.com/api/partidos';

  const formatearFechaInput = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const nombreEquipo = (p) =>
    p?.participacionTemporada?.equipoCompetencia?.equipo?.nombre ||
    p?.equipo?.nombre || 'Equipo';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validar = () => {
    if (!form.participacionFaseLocal || !form.participacionFaseVisitante)
      return 'Debe seleccionar ambos equipos';
    if (form.participacionFaseLocal === form.participacionFaseVisitante)
      return 'Equipos deben ser distintos';
    if (!form.fecha) return 'Debe ingresar fecha';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const errorValidacion = validar();
    if (errorValidacion) return setError(errorValidacion);

    const payload = {
      ...form,
      fase: faseId,
      fecha: new Date(form.fecha).toISOString(),
      marcadorLocal: Number(form.marcadorLocal),
      marcadorVisitante: Number(form.marcadorVisitante),
    };

    try {
      setCargando(true);
      const res = await fetch(`${apiBase}${editando ? `/${partido._id}` : ''}`, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Error al guardar');

      const actualizado = await res.json();
      onGuardar(actualizado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Estado *</label>
        <select name="estado" value={form.estado} onChange={handleChange} className="select w-full">
          <option value="programado">Programado</option>
          <option value="en_juego">En juego</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Fecha *</label>
        <input
          type="datetime-local"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          className="input w-full"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Ubicación</label>
        <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange} className="input w-full" />
      </div>

      <div>
        <label className="block font-medium">Equipo Local *</label>
        <select
          name="participacionFaseLocal"
          value={form.participacionFaseLocal}
          onChange={handleChange}
          className="select w-full"
        >
          <option value="">Seleccionar equipo</option>
          {participantes.map((p) => (
            <option key={p._id} value={p._id}>
              {nombreEquipo(p)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Equipo Visitante *</label>
        <select
          name="participacionFaseVisitante"
          value={form.participacionFaseVisitante}
          onChange={handleChange}
          className="select w-full"
        >
          <option value="">Seleccionar equipo</option>
          {participantes.map((p) => (
            <option key={p._id} value={p._id}>
              {nombreEquipo(p)}
            </option>
          ))}
        </select>
      </div>

      {form.estado === 'finalizado' && (
        <>
          <div>
            <label className="block font-medium">Marcador Local</label>
            <input
              type="number"
              name="marcadorLocal"
              value={form.marcadorLocal}
              onChange={handleChange}
              className="input w-full"
              min={0}
            />
          </div>
          <div>
            <label className="block font-medium">Marcador Visitante</label>
            <input
              type="number"
              name="marcadorVisitante"
              value={form.marcadorVisitante}
              onChange={handleChange}
              className="input w-full"
              min={0}
            />
          </div>
        </>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" className="btn btn-primary w-full" disabled={cargando}>
        {cargando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
      </button>
    </form>
  );
}
