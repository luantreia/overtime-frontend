import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Spinner } from '../components/ui';
import { PerfilUsuario } from '../components/features/usuarios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
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
            return;
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
      // Aquí podríamos mostrar un toast de éxito en lugar de alert
    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios en el perfil.');
    }
  };

  // Loading state con spinner moderno
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Spinner size="lg" message="Cargando perfil..." />
          <p className="mt-4 text-gray-600">Preparando tu perfil...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (!datos) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="danger" className="max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2">Error al cargar perfil</h3>
              <p className="text-gray-600 mb-4">
                No se pudieron cargar los datos del perfil.
              </p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header con información del usuario */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Mi Perfil
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gestiona tu información personal y configuración
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={datos.activo ? 'success' : 'danger'}>
                  {datos.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
                </Badge>
                <Badge variant={
                  datos.rol === 'admin' ? 'danger' :
                  datos.rol === 'moderador' ? 'warning' : 'secondary'
                }>
                  {datos.rol === 'admin' ? '👑 Admin' :
                   datos.rol === 'moderador' ? '⚖️ Moderador' : '👤 Usuario'}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contenido principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PerfilUsuario
            usuario={datos}
            editable={modoEdicion}
            onSave={handleGuardar}
            onCancel={() => setModoEdicion(false)}
          />
        </motion.div>

        {/* Acciones adicionales */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!modoEdicion && (
                <Button
                  variant="primary"
                  onClick={() => setModoEdicion(true)}
                  className="flex-1 sm:flex-none"
                >
                  ✏️ Editar Perfil
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigate('/configuracion')}
                className="flex-1 sm:flex-none"
              >
                ⚙️ Configuración
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/notificaciones')}
                className="flex-1 sm:flex-none"
              >
                🔔 Notificaciones
              </Button>

              {datos.rol === 'admin' && (
                <Button
                  variant="secondary"
                  onClick={() => navigate('/admin')}
                  className="flex-1 sm:flex-none"
                >
                  👑 Panel Admin
                </Button>
              )}

              <Button
                variant="info"
                onClick={() => navigate('/admin')}
                className="flex-1 sm:flex-none"
              >
                📊 Panel de Gestión
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Zona de peligro */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card variant="danger" className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Zona de Peligro
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4 text-sm">
                Estas acciones son irreversibles. Asegúrate de saber lo que haces.
              </p>
              <Button
                variant="danger"
                onClick={handleEliminarCuenta}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                🗑️ Eliminar Cuenta
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
