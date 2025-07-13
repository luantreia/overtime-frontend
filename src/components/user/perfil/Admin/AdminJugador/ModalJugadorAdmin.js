import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import SolicitudesContrato from '../solicitudesContrato';
import TarjetaJugadorEquipo from '../../../../modals/ModalJugador/tarjetaJugadorEquipo';
import { useAuth } from '../../../../../context/AuthContext.js';

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'N/A';
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return 'N/A';
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

export default function ModalJugadorAdmin({ jugadorId, token, onClose }) {
  const { user } = useAuth();
  const usuarioId = user?.uid;
  const rol = user?.rol;
  const [jugador, setJugador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [nuevoAdmin, setNuevoAdmin] = useState('');
  const [contratos, setContratos] = useState([]);

  const cargarDatos = useCallback(async () => {
    if (!jugadorId || !token) return;

    setLoading(true);
    setError(null);
    try {
      const [resJugador, resContratos] = await Promise.all([
        fetch(`https://overtime-ddyl.onrender.com/api/jugadores/${jugadorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?jugador=${jugadorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resJugador.ok) throw new Error('No se pudo cargar el jugador');
      if (!resContratos.ok) throw new Error('No se pudieron cargar los contratos');

      const dataJugador = await resJugador.json();
      const dataContratos = await resContratos.json();

      setJugador(dataJugador);
      setAdmins(Array.isArray(dataJugador.administradores) ? dataJugador.administradores : []);
      setContratos(dataContratos);

      setFormData({
        nombre: dataJugador.nombre || '',
        alias: dataJugador.alias || '',
        fechaNacimiento: dataJugador.fechaNacimiento?.substring(0, 10) || '',
        nacionalidad: dataJugador.nacionalidad || '',
        genero: dataJugador.genero || 'otro',
        foto: dataJugador.foto || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jugadorId, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleInput = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const guardarCambios = async () => {
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugadores/${jugadorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al guardar cambios');
      const actualizado = await res.json();
      setJugador(actualizado);
      setEditando(false);
    } catch (err) {
      setError(err.message);
    }
  };

    const agregarAdmin = async () => {
    if (!nuevoAdmin.trim()) return;
    try {
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugadores/${jugadorId}/administradores`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: nuevoAdmin.trim() }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'No se pudo agregar administrador');

        setAdmins(Array.isArray(data.administradores) ? data.administradores : []);        setNuevoAdmin('');
    } catch (err) {
        alert(`Error al agregar administrador: ${err.message}`);
    }
    };

  const quitarAdmin = async (adminId) => {
    if (!window.confirm('¿Quitar este administrador?')) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugadores/${jugadorId}/administradores/${adminId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al quitar administrador');
      setAdmins(Array.isArray(data.administradores) ? data.administradores : []);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <ModalBase title="Cargando..." onClose={onClose}><p>Cargando jugador...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p>{error}</p></ModalBase>;

  return (
    <ModalBase title={`Jugador: ${jugador.nombre}`} onClose={onClose}>
      {/* Datos básicos */}
      <section className="mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Datos Básicos</h3>
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
                <input className="input" name={field} value={formData[field]} onChange={handleInput} />
              </div>
            ))}
            <div>
              <label className="font-medium">Género</label>
              <select className="input" name="genero" value={formData.genero} onChange={handleInput}>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
        )}
      </section>

    {/* Administradores */}
    <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Administradores</h3>

        {Array.isArray(admins) && admins.length > 0 ? (
            <ul className="mb-2 max-h-40 overflow-auto border rounded">
            {admins.map((a) => (
                <li
                key={a._id || a}
                className="flex justify-between items-center border-b py-1 px-2 last:border-b-0"
                >
                <span>{a.email || a.nombre || a}</span>
                <button
                    className="btn-danger text-xs"
                    onClick={() => quitarAdmin(a._id || a)}
                >
                    Quitar
                </button>
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
            onChange={(e) => setNuevoAdmin(e.target.value)}
            className="input flex-grow"
            />
            <button
            className="btn-primary"
            onClick={agregarAdmin}
            disabled={!nuevoAdmin.trim()}
            >
            Agregar
            </button>
        </div>
    </section>

      {/* Contratos */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Relaciones jugador-equipo</h3>
        {contratos.length === 0 ? (
          <p>No tiene relaciones activas.</p>
        ) : (
          <div
            className="
              flex flex-wrap gap-4
              max-h-[280px] overflow-y-auto
              py-2 px-1
              bg-gray-50 rounded-md
              border border-gray-200
            "
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent',
            }}
          >
            {contratos.map(c => (
              <TarjetaJugadorEquipo
                key={c._id}
                jugador={{
                  nombre: jugador.nombre,
                  edad: calcularEdad(jugador.fechaNacimiento),
                  nacionalidad: jugador.nacionalidad,
                  foto: jugador.foto,
                }}
                relacion={{
                  equipo: c.equipo,
                  numero: c.numero,
                  rol: c.rol,
                  foto: c.foto,
                }}
              />
            ))}
          </div>
        )}
      </section>
      <SolicitudesContrato jugadorId={jugadorId} token={token} usuarioId={usuarioId} rol={rol} />

    </ModalBase>
  );
}
