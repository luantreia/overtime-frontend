import React, { useState, useEffect } from 'react';

export default function SeccionAdministradores({ organizacionId, token }) {
  const [admins, setAdmins] = useState([]);
  const [nuevoAdmin, setNuevoAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/organizaciones/${organizacionId}/administradores`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar administradores');
      const data = await res.json();
      setAdmins(data.administradores || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizacionId && token) cargarAdmins();
  }, [organizacionId, token]);

  const agregarAdmin = async () => {
    if (!nuevoAdmin.trim()) return;
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/organizaciones/${organizacionId}/administradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: nuevoAdmin.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'No se pudo agregar administrador');
      setAdmins(data.administradores || []);
      setNuevoAdmin('');
    } catch (e) {
      setError(e.message);
    }
  };

  const quitarAdmin = async (adminId) => {
    if (!window.confirm('¿Quitar este administrador?')) return;
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/organizaciones/${organizacionId}/administradores/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al quitar administrador');
      setAdmins(data.administradores || []);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Administradores</h3>

      {loading && <p>Cargando administradores...</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {!loading && admins.length === 0 && <p className="text-gray-600 mb-2">No hay administradores asignados.</p>}

      {!loading && admins.length > 0 && (
        <ul className="mb-2 max-h-40 overflow-auto border rounded">
          {admins.map(a => (
            <li key={a._id} className="flex justify-between items-center border-b py-1 px-2 last:border-b-0">
              <span>{a.email || a.nombre || a._id}</span>
              <button className="btn-danger text-xs" onClick={() => quitarAdmin(a._id)}>Quitar</button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Email del nuevo admin"
          value={nuevoAdmin}
          onChange={e => setNuevoAdmin(e.target.value)}
          className="input flex-grow"
        />
        <button className="btn-primary" onClick={agregarAdmin} disabled={!nuevoAdmin.trim()}>
          Agregar
        </button>
      </div>
    </section>
  );
}
