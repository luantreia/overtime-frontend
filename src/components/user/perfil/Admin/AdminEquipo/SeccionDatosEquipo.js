import React from 'react';

export default function SeccionDatosEquipo({ equipo, formData, editando, onChange, onGuardar, onCancelar, onEditar }) {
  if (!equipo) return null;

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-xl font-semibold">Datos del equipo</h3>
        {editando ? (
          <div className="space-x-2">
            <button className="btn-primary" onClick={onGuardar}>Guardar</button>
            <button className="btn-secondary" onClick={onCancelar}>Cancelar</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onEditar}>Editar</button>
        )}
      </div>
      {!editando ? (
        <ul className="mt-2 space-y-1">
          <li><strong>Nombre:</strong> {equipo.nombre}</li>
          <li><strong>País:</strong> {equipo.pais || '-'}</li>
          <li><strong>Tipo:</strong> {equipo.tipo || '-'}</li>
          <li><strong>Colores:</strong> {equipo.colores?.join(', ') || '-'}</li>
          <li><strong>Escudo:</strong> {equipo.escudo ? <a href={equipo.escudo} target="_blank" rel="noopener noreferrer">ver</a> : 'No disponible'}</li>
          <li><strong>Federación:</strong> {equipo.federacion || '-'}</li>
          <li><strong>Selección nacional:</strong> {equipo.esSeleccionNacional ? 'Sí' : 'No'}</li>
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {['nombre', 'pais', 'tipo', 'colores', 'escudo', 'federacion'].map(field => (
            <div key={field}>
              <label className="font-medium capitalize">{field}</label>
              <input className="input" name={field} value={formData[field]} onChange={onChange} />
            </div>
          ))}
          <div>
            <label className="font-medium">Selección Nacional</label>
            <input type="checkbox" name="esSeleccionNacional" checked={formData.esSeleccionNacional} onChange={onChange} />
          </div>
        </div>
      )}
    </section>
  );
}
