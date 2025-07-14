import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../ModalBase';
import SolicitudesContrato from '../solicitudesContrato.js';
import { useAuth } from '../../../../../context/AuthContext.js';

import SeccionDatosEquipo from './SeccionDatosEquipo';
import SeccionAdministradoresEquipo from './SeccionAdministradoresEquipo';
import SeccionContratosJugadorEquipo from './SeccionContratosJugadorEquipo';

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
      <SeccionDatosEquipo
        equipo={equipo}
        formData={formData}
        editando={editando}
        onChange={handleInput}
        onGuardar={guardarCambios}
        onCancelar={() => setEditando(false)}
        onEditar={() => setEditando(true)}
      />

      <SeccionAdministradoresEquipo
        admins={admins}
        nuevoAdmin={nuevoAdmin}
        onNuevoAdminChange={e => setNuevoAdmin(e.target.value)}
        onAgregarAdmin={agregarAdmin}
        onQuitarAdmin={quitarAdmin}
      />

      <SeccionContratosJugadorEquipo
        jugadoresEquipo={jugadoresEquipo}
        editandoContratoId={editandoContratoId}
        contratoEditado={contratoEditado}
        setContratoEditado={setContratoEditado}
        setEditandoContratoId={setEditandoContratoId}
        guardarContratoEditado={guardarContratoEditado}
      />

      <SolicitudesContrato equipoId={equipoId} token={token} usuarioId={usuarioId} rol={rol} />
    </ModalBase>
  );
}
