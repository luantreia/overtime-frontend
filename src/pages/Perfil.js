// src/pages/Perfil.js

import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

export default function Perfil() {
  const { user } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login'); // redirige si no está autenticado
      return;
    }

    const obtenerDatos = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/mi-perfil', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await auth.currentUser.delete(); // elimina de Firebase
      alert('Tu cuenta ha sido eliminada.');
      navigate('/');
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error);
      alert('Hubo un error al eliminar la cuenta.');
    }
  };

  if (cargando) return <p>Cargando perfil...</p>;

  if (!datos) return <p>No se pudieron cargar los datos del perfil.</p>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h2>Mi Perfil</h2>
      <p><strong>Nombre:</strong> {datos.nombre}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Rol:</strong> {datos.rol}</p>

      <button onClick={() => navigate('/editar-perfil')}>Editar perfil</button>
      <button onClick={handleEliminarCuenta} style={{ marginLeft: 10, color: 'red' }}>
        Eliminar cuenta
      </button>
    </div>
  );
}
