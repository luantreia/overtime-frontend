import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import { useAuth } from '../../../../../context/AuthContext';
import SeccionDatosJugador from './SeccionDatosJugador';
import SeccionAdministradoresJugador from './SeccionAdministradoresJugador';
import SeccionContratosJugador from './SeccionContratosJugadorEquipos';
import SolicitudesContrato from '../solicitudesContrato';

const SECCIONES = [
  { key: 'datos', label: 'Datos' },
  { key: 'admins', label: 'Administradores' },
  { key: 'contratos', label: 'Contratos' },
];

export default function ModalJugadorAdmin({ jugadorId, token, onClose }) {
  const { user } = useAuth();
  const usuarioId = user?.uid;
  const rol = user?.rol;

  const [seccionActiva, setSeccionActiva] = useState('datos');
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

  const handleInput = (e) => {
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
      setAdmins(Array.isArray(data.administradores) ? data.administradores : []);
      setNuevoAdmin('');
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
      {/* Navegación */}
      <div className="flex gap-2 mb-4 border-b pb-2">
        {SECCIONES.map(({ key, label }) => (
          <button
            key={key}
            className={`px-3 py-1 rounded font-semibold ${seccionActiva === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setSeccionActiva(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido de sección activa */}
      {seccionActiva === 'datos' && (
        <SeccionDatosJugador
          jugador={jugador}
          formData={formData}
          editando={editando}
          onChange={handleInput}
          onGuardar={guardarCambios}
          onCancelar={() => setEditando(false)}
          onEditar={() => setEditando(true)}
        />
      )}

      {seccionActiva === 'admins' && (
        <SeccionAdministradoresJugador
          admins={admins}
          nuevoAdmin={nuevoAdmin}
          onNuevoAdminChange={(e) => setNuevoAdmin(e.target.value)}
          onAgregarAdmin={agregarAdmin}
          onQuitarAdmin={quitarAdmin}
        />
      )}

      {seccionActiva === 'contratos' && (
        <>
          <SeccionContratosJugador
            contratos={contratos}
            jugadorId={jugadorId}
            token={token}
            usuarioId={usuarioId}
            rol={rol}
          />

          <div className="mt-6 border-t pt-4">
            <h4 className="text-lg font-semibold mb-2">Solicitudes de Contrato</h4>
            <SolicitudesContrato
              jugadorId={jugadorId}
              token={token}
              usuarioId={usuarioId}
              rol={rol}
            />
          </div>
        </>
      )}
    </ModalBase>
  );
}
