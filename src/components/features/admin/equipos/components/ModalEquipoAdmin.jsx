import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../../shared/ModalBase';
import SolicitudesContrato from '../../solicitudes/SolicitudesContrato';
import SolicitudesContratoEquipoCompetencia from '../../solicitudes/SolicitudesContratoEquipoCompetencia';
import { useAuth } from '../../../../../context/AuthContext'; 

import SeccionAmistososEquipo from './SeccionAmistososEquipo';
import SeccionDatosEquipo from './SeccionDatosEquipo';
import SeccionAdministradoresEquipo from './SeccionAdministradoresEquipo';
import SeccionContratosJugadorEquipo from './SeccionContratosJugadoresEquipo';
import SeccionContratosEquipoCompetencias from './SeccionContratosEquipoCompetencias';

const SECCIONES = [
  { key: 'datos', label: 'Datos' },
  { key: 'admins', label: 'Administradores' },
  { key: 'contratos', label: 'Jugadores' },
  { key: 'competencias', label: 'Competencias' },
  { key: 'amistosos', label: 'Amistosos' },
];

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
  const [seccionActiva, setSeccionActiva] = useState('datos');

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
      const [equipoData, jugadoresData] = await Promise.all([
        resEquipo.json(),
        resJugadores.json(),
      ]);

      setEquipo(equipoData);
      setJugadoresEquipo(jugadoresData);

      // Cargar administradores
      try {
        const resAdmins = await fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoId}/administradores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resAdmins.ok) {
          const adminsData = await resAdmins.json();
          setAdmins(adminsData);
        }
      } catch (err) {
        console.error('Error cargando administradores:', err);
      }

      setFormData({
        nombre: equipoData.nombre || '',
        pais: equipoData.pais || '',
        tipo: equipoData.tipo || '',
        colores: equipoData.colores || [],
        escudo: equipoData.escudo || '',
        foto: equipoData.foto || '',
        federacion: equipoData.federacion || '',
        sitioWeb: equipoData.sitioWeb || '',
        descripcion: equipoData.descripcion || '',
        fechaFormacion: equipoData.fechaFormacion || '',
        fechaDisolucion: equipoData.fechaDisolucion || '',
        esSeleccionNacional: equipoData.esSeleccionNacional || false,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [equipoId, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGuardar = async () => {
    try {
      const fmtDate = (val) => {
        if (!val) return undefined;
        const s = String(val).slice(0, 10);
        return s && s.length === 10 ? `${s}T00:00:00.000Z` : undefined;
      };

      const payload = {
        ...formData,
        colores: Array.isArray(formData.colores) ? formData.colores : formData.colores.split(',').map(c => c.trim()),
        fechaFormacion: fmtDate(formData.fechaFormacion),
        fechaDisolucion: fmtDate(formData.fechaDisolucion),
      };

      const response = await fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al actualizar equipo');

      await cargarDatos();
      setEditando(false);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  };

  const handleCancelar = () => {
    setEditando(false);
    setFormData({
      nombre: equipo.nombre || '',
      pais: equipo.pais || '',
      tipo: equipo.tipo || '',
      colores: equipo.colores || [],
      escudo: equipo.escudo || '',
      foto: equipo.foto || '',
      federacion: equipo.federacion || '',
      sitioWeb: equipo.sitioWeb || '',
      descripcion: equipo.descripcion || '',
      fechaFormacion: equipo.fechaFormacion || '',
      fechaDisolucion: equipo.fechaDisolucion || '',
      esSeleccionNacional: equipo.esSeleccionNacional || false,
    });
  };

  const handleEditar = () => {
    setEditando(true);
  };

  const handleAgregarAdmin = async () => {
    if (!nuevoAdmin.trim()) return;

    try {
      const response = await fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoId}/administradores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: nuevoAdmin.trim() }),
      });

      if (!response.ok) throw new Error('Error al agregar administrador');

      await cargarDatos();
      setNuevoAdmin('');
    } catch (err) {
      alert('Error al agregar administrador: ' + err.message);
    }
  };

  const handleQuitarAdmin = async (adminId) => {
    if (!window.confirm('¿Estás seguro de quitar este administrador?')) return;

    try {
      const response = await fetch(`https://overtime-ddyl.onrender.com/api/equipos/${equipoId}/administradores/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al quitar administrador');

      await cargarDatos();
    } catch (err) {
      alert('Error al quitar administrador: ' + err.message);
    }
  };

  const guardarContratoEditado = async (contratoId) => {
    try {
      const payload = {
        ...contratoEditado,
        desde: contratoEditado.desde ? new Date(contratoEditado.desde).toISOString() : undefined,
        hasta: contratoEditado.hasta ? new Date(contratoEditado.hasta).toISOString() : undefined,
      };

      const response = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo/${contratoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al actualizar contrato');

      await cargarDatos();
      setEditandoContratoId(null);
      setContratoEditado({});
    } catch (err) {
      alert('Error al guardar contrato: ' + err.message);
    }
  };

  if (loading) return <ModalBase title="Cargando equipo..." onClose={onClose}><p>Cargando...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p className="text-red-600">{error}</p></ModalBase>;
  if (!equipo) return null;

  return (
    <ModalBase title={`Administrar Equipo: ${equipo.nombre}`} onClose={onClose}>
      <div className="space-y-6">
        {/* Navegación por secciones */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {SECCIONES.map(seccion => (
              <button
                key={seccion.key}
                onClick={() => setSeccionActiva(seccion.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  seccionActiva === seccion.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {seccion.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de secciones */}
        {seccionActiva === 'datos' && (
          <SeccionDatosEquipo
            equipo={equipo}
            formData={formData}
            editando={editando}
            onChange={handleChange}
            onGuardar={handleGuardar}
            onCancelar={handleCancelar}
            onEditar={handleEditar}
          />
        )}

        {seccionActiva === 'admins' && (
          <SeccionAdministradoresEquipo
            admins={admins}
            nuevoAdmin={nuevoAdmin}
            onNuevoAdminChange={(e) => setNuevoAdmin(e.target.value)}
            onAgregarAdmin={handleAgregarAdmin}
            onQuitarAdmin={handleQuitarAdmin}
          />
        )}

        {seccionActiva === 'contratos' && (
          <SeccionContratosJugadorEquipo
            jugadoresEquipo={jugadoresEquipo}
            editandoContratoId={editandoContratoId}
            contratoEditado={contratoEditado}
            setContratoEditado={setContratoEditado}
            setEditandoContratoId={setEditandoContratoId}
            guardarContratoEditado={guardarContratoEditado}
            equipoId={equipoId}
            usuarioId={usuarioId}
          />
        )}

        {seccionActiva === 'competencias' && (
          <SeccionContratosEquipoCompetencias
            equipoId={equipoId}
            token={token}
            usuarioId={usuarioId}
          />
        )}

        {seccionActiva === 'amistosos' && (
          <SeccionAmistososEquipo
            equipoId={equipoId}
            token={token}
          />
        )}
      </div>
    </ModalBase>
  );
}
