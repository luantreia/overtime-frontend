import React, { useEffect, useState, useCallback } from 'react';
import ModalBase from '../../components/ModalBase';
import { useAuth } from '../../../../../context/AuthContext';
import SeccionDatosJugador from './SeccionDatosJugador';
import SeccionAdministradoresJugador from './SeccionAdministradoresJugador';
import SeccionContratosJugador from './SeccionContratosJugadorEquipos';
import SolicitudesContrato from '../../solicitudes/SolicitudesContrato';

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
        fetch(`/api/jugadores/${jugadorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/jugador-equipo?jugador=${jugadorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resJugador.ok) throw new Error('No se pudo cargar el jugador');
      if (!resContratos.ok) throw new Error('No se pudieron cargar los contratos');

      const dataJugador = await resJugador.json();
      const dataContratos = await resContratos.json();

      setJugador(dataJugador);
      setContratos(dataContratos);

      // Cargar administradores del jugador si existe endpoint
      try {
        const resAdmins = await fetch(`/api/jugadores/${jugadorId}/administradores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resAdmins.ok) {
          const adminsData = await resAdmins.json();
          setAdmins(adminsData);
        }
      } catch (err) {
        console.error('Error cargando administradores:', err);
      }

      // Inicializar formData con datos actuales
      setFormData({
        nombre: dataJugador.nombre || '',
        fechaNacimiento: dataJugador.fechaNacimiento || '',
        nacionalidad: dataJugador.nacionalidad || '',
        posicion: dataJugador.posicion || '',
        altura: dataJugador.altura || '',
        peso: dataJugador.peso || '',
        foto: dataJugador.foto || '',
        manoHabil: dataJugador.manoHabil || '',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    try {
      const response = await fetch(`/api/jugadores/${jugadorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al actualizar jugador');

      await cargarDatos();
      setEditando(false);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  };

  const handleCancelar = () => {
    setEditando(false);
    setFormData({
      nombre: jugador.nombre || '',
      fechaNacimiento: jugador.fechaNacimiento || '',
      nacionalidad: jugador.nacionalidad || '',
      posicion: jugador.posicion || '',
      altura: jugador.altura || '',
      peso: jugador.peso || '',
      foto: jugador.foto || '',
      manoHabil: jugador.manoHabil || '',
    });
  };

  const handleEditar = () => {
    setEditando(true);
  };

  const handleAgregarAdmin = async () => {
    if (!nuevoAdmin.trim()) return;

    try {
      const response = await fetch(`/api/jugadores/${jugadorId}/administradores`, {
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
      const response = await fetch(`/api/jugadores/${jugadorId}/administradores/${adminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al quitar administrador');

      await cargarDatos();
    } catch (err) {
      alert('Error al quitar administrador: ' + err.message);
    }
  };

  if (loading) return <ModalBase title="Cargando jugador..." onClose={onClose}><p>Cargando...</p></ModalBase>;
  if (error) return <ModalBase title="Error" onClose={onClose}><p className="text-red-600">{error}</p></ModalBase>;
  if (!jugador) return null;

  return (
    <ModalBase title={`Administrar Jugador: ${jugador.nombre}`} onClose={onClose}>
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
          <SeccionDatosJugador
            jugador={jugador}
            formData={formData}
            editando={editando}
            onChange={handleChange}
            onGuardar={handleGuardar}
            onCancelar={handleCancelar}
            onEditar={handleEditar}
          />
        )}

        {seccionActiva === 'admins' && (
          <SeccionAdministradoresJugador
            admins={admins}
            nuevoAdmin={nuevoAdmin}
            onNuevoAdminChange={(e) => setNuevoAdmin(e.target.value)}
            onAgregarAdmin={handleAgregarAdmin}
            onQuitarAdmin={handleQuitarAdmin}
          />
        )}

        {seccionActiva === 'contratos' && (
          <SeccionContratosJugador
            contratos={contratos}
            jugadorId={jugadorId}
            token={token}
          />
        )}
      </div>
    </ModalBase>
  );
}
