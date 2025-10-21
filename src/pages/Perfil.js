import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import MostrarPerfil from '../components/user/perfil/MostrarPerfil';
import EditarPerfil from '../components/user/perfil/EditarPerfil';
import { motion } from 'framer-motion';

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
          if (res.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
            auth.signOut();
            navigate('/login');
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setDatos(data);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, [user, navigate]);

  const handleEliminarCuenta = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/eliminar', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error en backend: ${res.status}`);

      await auth.currentUser.delete();
      alert('Tu cuenta ha sido eliminada exitosamente.');
      navigate('/');
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      alert(`Hubo un error: ${error.message || 'Inténtalo de nuevo.'}`);
    }
  };

  const handleGuardar = async (nuevosDatos) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  // --- Loading ---
  if (cargando) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <motion.p
          className="text-xl font-semibold text-gray-700 animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
        >
          Cargando perfil...
        </motion.p>
      </div>
    );
  }

  // --- Error / Sin datos ---
  if (!datos) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <motion.p
          className="text-xl font-semibold text-red-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No se pudieron cargar los datos del perfil.
        </motion.p>
      </div>
    );
  }

  // --- Render Perfil ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 flex justify-center">
      <motion.div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {modoEdicion ? (
          <EditarPerfil datos={datos} onGuardar={handleGuardar} onCancelar={() => setModoEdicion(false)} />
        ) : (
          <MostrarPerfil datos={datos} onEditar={() => setModoEdicion(true)} onEliminar={handleEliminarCuenta} />
        )}
      </motion.div>
    </div>
  );
}
