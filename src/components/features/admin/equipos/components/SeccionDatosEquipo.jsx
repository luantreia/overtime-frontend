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
          <li><strong>Foto:</strong> {equipo.foto ? <a href={equipo.foto} target="_blank" rel="noopener noreferrer">ver</a> : 'No disponible'}</li>
          <li><strong>Federación:</strong> {equipo.federacion || '-'}</li>
          <li><strong>Sitio web:</strong> {equipo.sitioWeb ? <a href={equipo.sitioWeb} target="_blank" rel="noopener noreferrer">{equipo.sitioWeb}</a> : '-'}</li>
          <li><strong>Descripción:</strong> {equipo.descripcion || '-'}</li>
          <li><strong>Fecha de formación:</strong> {equipo.fechaFormacion ? String(equipo.fechaFormacion).slice(0,10) : '-'}</li>
          <li><strong>Fecha de disolución:</strong> {equipo.fechaDisolucion ? String(equipo.fechaDisolucion).slice(0,10) : '-'}</li>
          <li><strong>Selección nacional:</strong> {equipo.esSeleccionNacional ? 'Sí' : 'No'}</li>
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="font-medium">Nombre</label>
            <input className="input" name="nombre" value={formData.nombre} onChange={onChange} />
          </div>
          <div>
            <label className="font-medium">País</label>
            <input className="input" name="pais" value={formData.pais} onChange={onChange} />
          </div>
          <div>
            <label className="font-medium">Tipo</label>
            <select className="input" name="tipo" value={formData.tipo} onChange={onChange}>
              <option value="club">club</option>
              <option value="seleccion">seleccion</option>
              <option value="academia">academia</option>
              <option value="otro">otro</option>
            </select>
          </div>
          <div>
            <label className="font-medium">Colores</label>
            <input className="input" name="colores" value={formData.colores} onChange={onChange} />
          </div>
          <div>
            <label className="font-medium">Escudo</label>
            <input className="input" name="escudo" value={formData.escudo} onChange={onChange} />
          </div>
          <div>
            <label className="font-medium">Foto</label>
            <input className="input" name="foto" value={formData.foto} onChange={onChange} />
          </div>
          <div>
            <label className="font-medium">Federación</label>
            <input className="input" name="federacion" value={formData.federacion} onChange={onChange} />
          </div>
          <div>
            <label className="font-medium">Sitio web</label>
            <input className="input" name="sitioWeb" value={formData.sitioWeb} onChange={onChange} />
          </div>
          <div className="sm:col-span-2">
            <label className="font-medium">Descripción</label>
            <textarea className="input" name="descripcion" value={formData.descripcion} onChange={onChange} rows={3} />
          </div>
          <div>
            <label className="font-medium">Fecha de formación</label>
            <input type="date" className="input" name="fechaFormacion" value={(formData.fechaFormacion && String(formData.fechaFormacion).slice(0,10)) || ''} onChange={onChange} />
          </div>
          <div>
            <label className="font-medium">Fecha de disolución</label>
            <input type="date" className="input" name="fechaDisolucion" value={(formData.fechaDisolucion && String(formData.fechaDisolucion).slice(0,10)) || ''} onChange={onChange} />
          </div>
          <div>
            <label className="font-medium">Selección Nacional</label>
            <input type="checkbox" name="esSeleccionNacional" checked={formData.esSeleccionNacional} onChange={onChange} />
          </div>
        </div>
      )}
    </section>
  );
}
