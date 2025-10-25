import React, { useState, useEffect } from 'react';

export default function SeccionAdministradoresCompetencia({ competenciaId, token }) {
  const [admins, setAdmins] = useState([]);
  const [nuevoAdmin, setNuevoAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarAdmins = async () => {
    if (!competenciaId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competenciaId}/administradores`, {
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
    cargarAdmins();
  }, [competenciaId, token]);

  const agregarAdmin = async () => {
    if (!nuevoAdmin.trim()) return;
    setError(null);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competenciaId}/administradores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competenciaId}/administradores/${adminId}`, {
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
      <div className="border rounded-xl p-4 bg-white shadow-sm space-y-4">
        <h3 className="text-xl font-semibold">Administradores</h3>

        {loading && <p>Cargando administradores...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && admins.length === 0 && (
          <p className="text-gray-600">No hay administradores asignados.</p>
        )}

        {!loading && admins.length > 0 && (
          <ul className="max-h-40 overflow-auto border rounded divide-y">
            {admins.map((a) => (
              <li key={a._id} className="flex justify-between items-center py-2 px-3">
                <span>{a.email || a.nombre || a._id}</span>
                <button className="btn-danger" onClick={() => quitarAdmin(a._id)}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email del nuevo admin"
            value={nuevoAdmin}
            onChange={(e) => setNuevoAdmin(e.target.value)}
            className="input flex-grow"
          />
          <button className="btn-primary" onClick={agregarAdmin} disabled={!nuevoAdmin.trim()}>
            Agregar
          </button>
        </div>
      </div>
    </section>
  );
}
