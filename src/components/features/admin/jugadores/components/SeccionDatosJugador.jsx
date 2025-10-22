import React from 'react';

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'N/A';
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return 'N/A';
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

export default function SeccionDatosJugador({ jugador, formData, editando, onChange, onGuardar, onCancelar, onEditar }) {
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Datos Básicos</h3>
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
          <li><strong>Alias:</strong> {jugador.alias || '-'}</li>
          <li><strong>Fecha de nacimiento:</strong> {jugador.fechaNacimiento?.substring(0, 10) || '-'}</li>
          <li><strong>Edad:</strong> {calcularEdad(jugador.fechaNacimiento)}</li>
          <li><strong>Nacionalidad:</strong> {jugador.nacionalidad || '-'}</li>
          <li><strong>Género:</strong> {jugador.genero}</li>
          <li>
            <strong>Foto:</strong>{' '}
            {jugador.foto ? (
              <a href={jugador.foto} target="_blank" rel="noopener noreferrer">ver</a>
            ) : (
              'No disponible'
            )}
          </li>
        </ul>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {['nombre', 'alias', 'fechaNacimiento', 'nacionalidad', 'foto'].map(field => (
            <div key={field}>
              <label className="font-medium capitalize">{field}</label>
              <input className="input" name={field} value={formData[field]} onChange={onChange} />
            </div>
          ))}
          <div>
            <label className="font-medium">Género</label>
            <select className="input" name="genero" value={formData.genero} onChange={onChange}>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
