import React from 'react';

export default function SeccionAdministradoresJugador({ admins, nuevoAdmin, onNuevoAdminChange, onAgregarAdmin, onQuitarAdmin }) {
  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Administradores</h3>
      {Array.isArray(admins) && admins.length > 0 ? (
        <ul className="mb-2 max-h-40 overflow-auto border rounded">
          {admins.map((a) => (
            <li key={a._id || a} className="flex justify-between items-center border-b py-1 px-2 last:border-b-0">
              <span>{a.email || a.nombre || a}</span>
              <button className="btn-danger text-xs" onClick={() => onQuitarAdmin(a._id || a)}>Quitar</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-2 text-gray-600">No hay administradores asignados.</p>
      )}

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Email del nuevo admin"
          value={nuevoAdmin}
          onChange={onNuevoAdminChange}
          className="input flex-grow"
        />
        <button className="btn-primary" onClick={onAgregarAdmin} disabled={!nuevoAdmin.trim()}>
          Agregar
        </button>
      </div>
    </section>
  );
}
