import React from 'react';

export default function SeccionMarcadorFinal({ form, setForm }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  return (
    <>
      <div>
        <label className="block mb-1 font-medium">Marcador Local</label>
        <input
          type="number"
          name="marcadorLocal"
          value={form.marcadorLocal}
          onChange={handleChange}
          className="input input-bordered w-full"
          min={0}
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Marcador Visitante</label>
        <input
          type="number"
          name="marcadorVisitante"
          value={form.marcadorVisitante}
          onChange={handleChange}
          className="input input-bordered w-full"
          min={0}
        />
      </div>
    </>
  );
}
