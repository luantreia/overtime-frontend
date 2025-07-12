import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';

export default function ModalCompetenciaAdmin({ competenciaId, token, onClose }) {
  const [competencia, setCompetencia] = useState(null);
  const [formData, setFormData] = useState({});
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [nuevoAdmin, setNuevoAdmin] = useState('');
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!competenciaId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competenciaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar la competencia');
      const data = await res.json();
      setCompetencia(data);
      setAdmins(data.administradores || []);
      setFormData({
        nombre: data.nombre || '',
        estado: data.estado || '',
        pais: data.pais || '',
        tipo: data.tipo || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [competenciaId, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleInput = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const guardarCambios = async () => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competenciaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al guardar cambios');
      const actualizado = await res.json();
      setCompetencia(actualizado);
      setEditando(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const agregarAdmin = async () => {
    if (!nuevoAdmin.trim()) return;
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
      setAdmins(data.administradores);
      setNuevoAdmin('');
    } catch (err) {
      alert(err.message);
    }
  };

  const quitarAdmin = async (adminId) => {
    if (!window.confirm('¿Quitar este administrador?')) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/${competenciaId}/administradores/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al quitar administrador');
      setAdmins(data.administradores);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <ModalBase title="Cargando..." onClose={onClose}><p>Cargando competencia...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;

  return (
    <ModalBase title={`Competencia: ${competencia.nombre}`} onClose={onClose}>
      {/* Datos Básicos */}
      <section className="mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Datos de la competencia</h3>
          {editando ? (
            <div className="space-x-2">
              <button className="btn-primary" onClick={guardarCambios}>Guardar</button>
              <button className="btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setEditando(true)}>Editar</button>
          )}
        </div>
        {!editando ? (
          <ul className="mt-2 space-y-1">
            <li><strong>Nombre:</strong> {competencia.nombre}</li>
            <li><strong>Estado:</strong> {competencia.estado || '-'}</li>
            <li><strong>País:</strong> {competencia.pais || '-'}</li>
            <li><strong>Tipo:</strong> {competencia.tipo || '-'}</li>
          </ul>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {['nombre', 'estado', 'pais', 'tipo'].map(field => (
              <div key={field}>
                <label className="font-medium capitalize">{field}</label>
                <input className="input" name={field} value={formData[field]} onChange={handleInput} />
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Administradores */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Administradores</h3>
        {admins.length === 0 ? (
          <p className="text-gray-600 mb-2">No hay administradores asignados.</p>
        ) : (
          <ul className="mb-2 max-h-40 overflow-auto border rounded">
            {admins.map(a => (
              <li key={a._id || a} className="flex justify-between items-center border-b py-1 px-2 last:border-b-0">
                <span>{a.email || a.nombre || a}</span>
                <button className="btn-danger text-xs" onClick={() => quitarAdmin(a._id || a)}>Quitar</button>
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
    </ModalBase>
  );
}