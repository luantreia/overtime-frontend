import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import SolicitudesContrato from '../solicitudesContrato.js';
import { useAuth } from '../../../../../context/AuthContext.js';

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

export default function ModalEquipoAdmin({ equipoId, token, onClose }) {
  const { user } = useAuth();
  const usuarioId = user?.uid;
  const rol = user?.rol;
  const [equipo, setEquipo] = useState(null);
  const [formData, setFormData] = useState({});
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [nuevoAdmin, setNuevoAdmin] = useState('');
  const [error, setError] = useState(null);
  const [jugadoresEquipo, setJugadoresEquipo] = useState([]);
  const [editandoContratoId, setEditandoContratoId] = useState(null);
  const [contratoEditado, setContratoEditado] = useState({});

  const cargarDatos = useCallback(async () => {
    if (!equipoId || !token) return;
    setLoading(true);
    try {
      const [resEquipo, resJugadores] = await Promise.all([
        fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?equipo=${equipoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!resEquipo.ok || !resJugadores.ok) throw new Error('Error al cargar datos');

      const dataEquipo = await resEquipo.json();
      const dataJugadores = await resJugadores.json();

      setEquipo(dataEquipo);
      setAdmins(dataEquipo.administradores || []);
      setJugadoresEquipo(dataJugadores);

      setFormData({
        nombre: dataEquipo.nombre || '',
        escudo: dataEquipo.escudo || '',
        tipo: dataEquipo.tipo || '',
        colores: dataEquipo.colores?.join(', ') || '',
        esSeleccionNacional: dataEquipo.esSeleccionNacional || false,
        pais: dataEquipo.pais || '',
        federacion: dataEquipo.federacion || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [equipoId, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleInput = e => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const guardarCambios = async () => {
    try {
      const body = {
        ...formData,
        colores: formData.colores?.split(',').map(c => c.trim()).filter(Boolean) || [],
        federacion: formData.federacion || null,
        escudo: formData.escudo || '',
        tipo: formData.tipo || 'club',
        pais: formData.pais || '',
        nombre: formData.nombre?.trim() || '',
        esSeleccionNacional: !!formData.esSeleccionNacional,
      };
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error al guardar cambios');
      const actualizado = await res.json();
      setEquipo(actualizado);
      setEditando(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const agregarAdmin = async () => {
    if (!nuevoAdmin.trim()) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoId}/administradores`, {
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
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoId}/administradores/${adminId}`, {
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

  const guardarContratoEditado = async (id) => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...contratoEditado,
          rol: contratoEditado.rol || '',
          numero: contratoEditado.numero || '',
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar contrato');
      setEditandoContratoId(null);
      setContratoEditado({});
      cargarDatos();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <ModalBase title="Cargando..." onClose={onClose}><p>Cargando equipo...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;

  return (
    <ModalBase title={`Equipo: ${equipo.nombre}`} onClose={onClose}>
      {/* Datos del equipo */}
      <section className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-xl font-semibold">Datos del equipo</h3>
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
                <input className="input" name={field} value={formData[field]} onChange={handleInput} />
              </div>
            ))}
            <div>
              <label className="font-medium">Selección Nacional</label>
              <input type="checkbox" name="esSeleccionNacional" checked={formData.esSeleccionNacional} onChange={handleInput} />
            </div>
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
          <input type="email" placeholder="Email del nuevo admin" value={nuevoAdmin} onChange={e => setNuevoAdmin(e.target.value)} className="input flex-grow" />
          <button className="btn-primary" onClick={agregarAdmin} disabled={!nuevoAdmin.trim()}>Agregar</button>
        </div>
      </section>

      {/* Contratos de jugadores */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Contratos activos</h3>
        {jugadoresEquipo.length === 0 ? (
          <p className="text-gray-600">No hay jugadores asociados actualmente.</p>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg border border-gray-300">
            <table className="min-w-[800px] table-auto text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Edad</th>
                  <th className="px-4 py-2">Rol</th>
                  <th className="px-4 py-2">Número</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2">Foto</th>
                  <th className="px-4 py-2">Desde</th>
                  <th className="px-4 py-2">Hasta</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jugadoresEquipo.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{c.jugador?.nombre}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{calcularEdad(c.jugador?.fechaNacimiento)}</td>
                    <td className="px-4 py-2">
                      {editandoContratoId === c._id ? (
                        <input
                          type="text"
                          className="input"
                          value={contratoEditado.rol || ''}
                          onChange={e => setContratoEditado({ ...contratoEditado, rol: e.target.value })}
                        />
                      ) : c.rol || '-'}
                    </td>
                    <td className="px-4 py-2">
                      {editandoContratoId === c._id ? (
                        <input
                          type="number"
                          className="input w-20"
                          value={contratoEditado.numero || ''}
                          onChange={e => setContratoEditado({ ...contratoEditado, numero: e.target.value })}
                        />
                      ) : c.numero || '-'}
                    </td>
                    <td className="px-4 py-2 capitalize">
                      {editandoContratoId === c._id ? (
                        <select
                          className="input"
                          value={contratoEditado.estado || c.estado}
                          onChange={e => setContratoEditado({ ...contratoEditado, estado: e.target.value })}
                        >
                          <option value="aceptado">Aceptado</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                      ) : c.estado}
                    </td>
                    <td className="px-4 py-2">
                      {editandoContratoId === c._id ? (
                        <input
                          type="text"
                          placeholder="URL foto"
                          className="input"
                          value={contratoEditado.foto || ''}
                          onChange={e => setContratoEditado({ ...contratoEditado, foto: e.target.value })}
                        />
                      ) : (
                        c.foto ? <a href={c.foto} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ver</a> : '-'
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editandoContratoId === c._id ? (
                        <input
                          type="date"
                          className="input"
                          value={contratoEditado.desde || ''}
                          onChange={e => setContratoEditado({ ...contratoEditado, desde: e.target.value })}
                        />
                      ) : (
                        c.desde ? new Date(c.desde).toLocaleDateString() : '-'
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editandoContratoId === c._id ? (
                        <input
                          type="date"
                          className="input"
                          value={contratoEditado.hasta || ''}
                          onChange={e => setContratoEditado({ ...contratoEditado, hasta: e.target.value })}
                        />
                      ) : (
                        c.hasta ? new Date(c.hasta).toLocaleDateString() : '-'
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {['aceptado', 'finalizado'].includes(c.estado) ? (
                        editandoContratoId === c._id ? (
                          <div className="flex gap-2">
                            <button onClick={() => guardarContratoEditado(c._id)} className="btn-primary btn-xs">Guardar</button>
                            <button onClick={() => { setEditandoContratoId(null); setContratoEditado({}); }} className="btn-secondary btn-xs">Cancelar</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditandoContratoId(c._id);
                              setContratoEditado({
                                rol: c.rol || '',
                                numero: c.numero || '',
                                estado: c.estado,
                                foto: c.foto || '',
                                desde: c.desde?.slice(0, 10) || '',
                                hasta: c.hasta?.slice(0, 10) || ''
                              });
                            }}
                            className="btn-outline btn-xs"
                          >
                            Editar
                          </button>
                        )
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {/* Solicitudes de contrato */}
      <SolicitudesContrato equipoId={equipoId} token={token} usuarioId={usuarioId} rol={rol} />
      


      
    </ModalBase>
  );
}
