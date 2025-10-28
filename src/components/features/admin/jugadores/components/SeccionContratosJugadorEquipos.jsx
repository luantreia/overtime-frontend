import React, { useState, useEffect } from 'react';
import SolicitudesContrato from '../../solicitudes/SolicitudesContrato';
import { useApi } from '../../../../../hooks/api/useApi';
import { useAuth } from  '../../../../../context/AuthContext';

export default function SeccionContratosJugador({ contratos, jugadorId }) {
  const { user } = useAuth();
  const { post, get, put, delete: del } = useApi();
  const [editandoContratoId, setEditandoContratoId] = useState(null);
  const [contratoEditado, setContratoEditado] = useState({});
  const [solicitudesPorContrato, setSolicitudesPorContrato] = useState({});
  const [lista, setLista] = useState(Array.isArray(contratos) ? contratos : []);

  const formatVal = (key, val) => {
    if (val === undefined || val === null || val === '') return '-';
    if (key === 'desde' || key === 'hasta') {
      const d = new Date(val);
      return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
    }
    return String(val);
  };

  const cargarSolicitudesEdicion = async () => {
    try {
      if (!Array.isArray(lista) || lista.length === 0) {
        setSolicitudesPorContrato({});
        return;
      }
      const results = await Promise.all(
        lista.map(async (c) => {
          try {
            const lista = await get(`/api/solicitudes-edicion?tipo=contratoJugadorEquipo&estado=pendiente&entidad=${c._id}`);
            return { id: c._id, solicitudes: Array.isArray(lista) ? lista : [] };
          } catch (e) {
            return { id: c._id, solicitudes: [] };
          }
        })
      );
      const mapa = results.reduce((acc, it) => { acc[it.id] = it.solicitudes; return acc; }, {});
      setSolicitudesPorContrato(mapa);
    } catch (e) {
      console.warn('Error cargando solicitudes de edición:', e?.message || e);
    }
  };

  const guardarContratoEditado = async (contratoId) => {
    try {
      await post('/api/solicitudes-edicion', {
        tipo: 'contratoJugadorEquipo',
        entidad: contratoId,
        datosPropuestos: {
          rol: contratoEditado.rol,
          estado: contratoEditado.estado,
          foto: contratoEditado.foto,
          desde: contratoEditado.desde,
          hasta: contratoEditado.hasta,
        },
      });
      setEditandoContratoId(null);
      setContratoEditado({});
      await cargarSolicitudesEdicion();
    } catch (err) {
      console.error('Error guardando contrato (jugador):', err);
    }
  };

  const aceptarSolicitud = async (solicitudId, contratoId) => {
    try {
      await put(`/api/solicitudes-edicion/${solicitudId}`, { estado: 'aceptado' });
      const actualizado = await get(`/api/jugador-equipo/${contratoId}`);
      if (actualizado && actualizado._id) {
        setLista(prev => prev.map(x => x._id === actualizado._id ? actualizado : x));
      }
      await cargarSolicitudesEdicion();
    } catch (err) {
      alert(err?.message || 'No se pudo aceptar la solicitud');
    }
  };

  const rechazarSolicitud = async (solicitudId) => {
    try {
      const motivoRechazo = window.prompt('Motivo de rechazo (opcional):') || '';
      await put(`/api/solicitudes-edicion/${solicitudId}`, { estado: 'rechazado', motivoRechazo });
      await cargarSolicitudesEdicion();
    } catch (err) {
      alert(err?.message || 'No se pudo rechazar la solicitud');
    }
  };

  const cancelarSolicitud = async (solicitudId) => {
    try {
      if (!window.confirm('¿Cancelar esta solicitud?')) return;
      await del(`/api/solicitudes-edicion/${solicitudId}`);
      await cargarSolicitudesEdicion();
    } catch (err) {
      alert(err?.message || 'No se pudo cancelar la solicitud');
    }
  };

  useEffect(() => {
    setLista(Array.isArray(contratos) ? contratos : []);
    cargarSolicitudesEdicion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(contratos)]);

  const eliminarContrato = async (c) => {
    try {
      if (c.estado === 'aceptado') {
        const confirmar = window.confirm('Este contrato está activo. Se marcará como finalizado y luego se eliminará. ¿Continuar?');
        if (!confirmar) return;
        const hoy = new Date().toISOString().slice(0, 10);
        const sol = await post('/api/solicitudes-edicion', {
          tipo: 'contratoJugadorEquipo',
          entidad: c._id,
          datosPropuestos: { estado: 'baja', hasta: hoy }
        });
        if (sol && sol._id) {
          await put(`/api/solicitudes-edicion/${sol._id}`, { estado: 'aceptado' });
        }
      } else {
        const confirmar = window.confirm('Esta acción eliminará permanentemente el contrato. ¿Continuar?');
        if (!confirmar) return;
      }
      await del(`/api/jugador-equipo/${c._id}`);
      setLista(prev => prev.filter(x => x._id !== c._id));
      setEditandoContratoId(null);
      setContratoEditado({});
      await cargarSolicitudesEdicion();
    } catch (err) {
      alert(err?.message || 'No se pudo eliminar el contrato');
    }
  };
  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Relaciones jugador-equipo</h3>
      {lista.length === 0 ? (
        <p>No tiene relaciones activas.</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Equipo</th>
                <th className="px-3 py-2 text-left font-medium">Rol</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                <th className="px-3 py-2 text-left font-medium">Foto</th>
                <th className="px-3 py-2 text-left font-medium">Desde</th>
                <th className="px-3 py-2 text-left font-medium">Hasta</th>
                <th className="px-3 py-2 text-left font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lista.map((c) => (
                <React.Fragment key={c._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-3 py-2">{c.equipo?.nombre || 'Equipo desconocido'}</td>
                    <td className="px-3 py-2">{c.rol || '-'}</td>
                    <td className="px-3 py-2 capitalize">{c.estado || '-'}</td>
                    <td className="px-3 py-2">{c.foto ? (
                        <a href={c.foto} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ver</a>
                      ) : '-'}</td>
                    <td className="px-3 py-2">{c.desde ? new Date(c.desde).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2">{c.hasta ? new Date(c.hasta).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {['aceptado', 'baja'].includes(c.estado) ? (
                        editandoContratoId === c._id ? (
                          <div className="flex gap-2">
                            <button onClick={() => guardarContratoEditado(c._id)} className="btn-primary btn-xs">Guardar</button>
                            <button onClick={() => { setEditandoContratoId(null); setContratoEditado({}); }} className="btn-secondary btn-xs">Cancelar</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditandoContratoId(c._id);
                                setContratoEditado({
                                  rol: c.rol || '',
                                  estado: c.estado,
                                  foto: c.foto || '',
                                  desde: c.desde ? String(c.desde).slice(0, 10) : '',
                                  hasta: c.hasta ? String(c.hasta).slice(0, 10) : '',
                                });
                              }}
                              className="btn-outline btn-xs"
                            >
                              Editar
                            </button>
                            <button onClick={() => eliminarContrato(c)} className="btn-outline btn-xs text-red-600">Eliminar</button>
                          </div>
                        )
                      ) : '-'}
                    </td>
                  </tr>
                  {editandoContratoId === c._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-3 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Rol</label>
                            <input
                              type="text"
                              className="input w-full"
                              value={contratoEditado.rol || ''}
                              onChange={e => setContratoEditado({ ...contratoEditado, rol: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Estado</label>
                            <select
                              className="input w-full"
                              value={contratoEditado.estado || c.estado}
                              onChange={e => setContratoEditado({ ...contratoEditado, estado: e.target.value })}
                            >
                              <option value="aceptado">Aceptado</option>
                              <option value="baja">Finalizado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Foto (URL)</label>
                            <input
                              type="text"
                              className="input w-full"
                              placeholder="URL foto"
                              value={contratoEditado.foto || ''}
                              onChange={e => setContratoEditado({ ...contratoEditado, foto: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Desde</label>
                            <input
                              type="date"
                              className="input w-full"
                              value={contratoEditado.desde || ''}
                              onChange={e => setContratoEditado({ ...contratoEditado, desde: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                            <input
                              type="date"
                              className="input w-full"
                              value={contratoEditado.hasta || ''}
                              onChange={e => setContratoEditado({ ...contratoEditado, hasta: e.target.value })}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <button onClick={() => guardarContratoEditado(c._id)} className="btn-primary btn-sm">Guardar cambios</button>
                            <button onClick={() => { setEditandoContratoId(null); setContratoEditado({}); }} className="btn-secondary btn-sm">Cancelar</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {Array.isArray(solicitudesPorContrato[c._id]) && solicitudesPorContrato[c._id].length > 0 && (
                    <tr className="bg-yellow-50/60">
                      <td colSpan={7} className="px-3 py-2">
                        <div className="text-xs text-gray-700">
                          <div className="font-semibold mb-1">Solicitudes de edición pendientes ({solicitudesPorContrato[c._id].length})</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {solicitudesPorContrato[c._id].map((s) => (
                              <li key={s._id}>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="uppercase tracking-wide mr-2">{s.estado}</span>
                                  <span className="text-gray-600">Propuesto:</span>
                                  {Object.keys(s.datosPropuestos || {}).length === 0 ? (
                                    <span className="ml-1">sin cambios</span>
                                  ) : (
                                    <div className="w-full mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                      {Object.entries(s.datosPropuestos || {}).map(([k, v]) => (
                                        <div key={k} className="flex items-center gap-2">
                                          <span className="font-medium">{k}:</span>
                                          <span className="text-gray-700">{formatVal(k, c[k])} → {formatVal(k, v)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="ml-2 flex items-center gap-2">
                                    {s.estado === 'pendiente' && (
                                      <>
                                        <button onClick={() => aceptarSolicitud(s._id, c._id)} className="btn-primary btn-xs">Aceptar</button>
                                        <button onClick={() => rechazarSolicitud(s._id)} className="btn-secondary btn-xs">Rechazar</button>
                                        {s.creadoPor === user?.uid && (
                                          <button onClick={() => cancelarSolicitud(s._id)} className="btn-outline btn-xs text-red-600">Cancelar</button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <SolicitudesContrato jugadorId={jugadorId} />
      </div>
    </section>
  );
}
