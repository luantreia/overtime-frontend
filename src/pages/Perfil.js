import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
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

        if (!res.ok) {
          // Handle specific HTTP errors, e.g., 404, 401
          if (res.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
            auth.signOut(); // Sign out the user
            navigate('/login');
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setDatos(data);
        setCargando(false);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setCargando(false);
        // Optionally set an error state here to display a more specific message
      }
    };

    obtenerDatos();
  }, [user, navigate]);

  const handleEliminarCuenta = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/eliminar', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Error al eliminar en el backend: ${res.status}`);
      }

      await auth.currentUser.delete(); // Firebase account deletion
      alert('Tu cuenta ha sido eliminada exitosamente.');
      navigate('/');
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      alert(`Hubo un error al eliminar la cuenta: ${error.message || 'Inténtalo de nuevo.'}`);
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
      alert('Perfil actualizado con éxito.');
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios en el perfil.');
    }
  };

  // --- Loading State ---
  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Cargando perfil...</p>
      </div>
    );
  }

  // --- Error/No Data State ---
  if (!datos) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-red-600">No se pudieron cargar los datos del perfil.</p>
      </div>
    );
  }

  // --- Render based on edit mode ---
  return modoEdicion ? (
    <EditarPerfil datos={datos} onGuardar={handleGuardar} onCancelar={() => setModoEdicion(false)} />
  ) : (
    <MostrarPerfil datos={datos} onEditar={() => setModoEdicion(true)} onEliminar={handleEliminarCuenta} />
  );
}