import React, { useState } from 'react';

export default function PartidoDatosGeneralesEditable({ datosIniciales, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(datosIniciales);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(datos);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      <label>
        Fecha:
        <input
          type="date"
          name="fecha"
          value={datos.fecha?.slice(0, 10) || ''}
          onChange={handleChange}
          className="input"
        />
      </label>

      <label>
        Ubicación:
        <input
            type="text"
            name="ubicacion"
            value={datos.ubicacion || ''}
            onChange={handleChange}
            className="input"
        />
        </label>

        <label>
        Estado:
        <select name="estado" value={datos.estado || ''} onChange={handleChange} className="input">
            <option value="">Seleccionar</option>
            <option value="pendiente">Pendiente</option>
            <option value="jugado">Jugado</option>
            <option value="cancelado">Cancelado</option>
        </select>
        </label>

      <div className="flex gap-3 mt-2">
        <button type="submit" className="btn btn-primary">Guardar</button>
        <button type="button" onClick={onCancelar} className="btn btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}
