import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/Authcontext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

import MostrarPerfil from '../components/user/perfil/MostrarPerfil';
import EditarPerfil from '../components/user/perfil/EditarPerfil';

export default function Perfil() {
  const { user } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const obtenerDatos = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/mi-perfil', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setDatos(data);
        setCargando(false);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setCargando(false);
      }
    };

    obtenerDatos();
  }, [user, navigate]);

  const handleEliminarCuenta = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) return;

    try {
      const token = await user.getIdToken();
      await fetch('https://overtime-ddyl.onrender.com/api/usuarios/eliminar', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      await auth.currentUser.delete();
      alert('Tu cuenta ha sido eliminada.');
      navigate('/');
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      alert('Hubo un error al eliminar la cuenta.');
    }
  };

  const handleGuardar = async (nuevosDatos) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/actualizar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevosDatos),
      });

      if (!res.ok) throw new Error('Error al actualizar perfil');

      const dataActualizada = await res.json();
      setDatos(dataActualizada);
      setModoEdicion(false);
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios');
    }
  };

  if (cargando) return <p>Cargando perfil...</p>;
  if (!datos) return <p>No se pudieron cargar los datos del perfil.</p>;

  return modoEdicion ? (
    <EditarPerfil datos={datos} onGuardar={handleGuardar} onCancelar={() => setModoEdicion(false)} />
  ) : (
    <MostrarPerfil datos={datos} onEditar={() => setModoEdicion(true)} onEliminar={handleEliminarCuenta} />
  );
}
