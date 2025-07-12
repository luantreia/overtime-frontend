// src/components/user/perfil/PanelAdmin.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PanelAdmin() {
  const { user } = useAuth();
  const [jugadores, setJugadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  const esAdminGlobal = user?.rol === 'admin';

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = await user.getIdToken();

        const [resJugadores, resEquipos] = await Promise.all([
          fetch('https://overtime-ddyl.onrender.com/api/jugadores/admin', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://overtime-ddyl.onrender.com/api/equipos/admin', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const jugadoresData = await resJugadores.json();
        const equiposData = await resEquipos.json();

        setJugadores(jugadoresData);
        setEquipos(equiposData);
      } catch (err) {
        console.error('Error al cargar datos administrativos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) cargarDatos();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto mt-12 p-4 sm:p-8 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <Link
          to="/admin/opciones"
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
        >
          <span className="material-icons">settings</span>
          Opciones avanzadas
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando entidades...</p>
      ) : (
        <div className="space-y-12">
          <SeccionEntidadConAgregar
            titulo="Jugadores en control"
            items={jugadores}
            tipo="jugador"
            rutaAgregar="/agregar-jugadores-multiple"
            esAdminGlobal={esAdminGlobal}
          />
          <SeccionEntidadConAgregar
            titulo="Equipos en control"
            items={equipos}
            tipo="equipo"
            rutaAgregar="/agregar-equipo"
            esAdminGlobal={esAdminGlobal}
          />
          <div className="flex justify-between items-center mt-8">
            <h2 className="text-2xl font-semibold text-gray-800">Otras acciones</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AdminLink to="/agregar-partido" text="Agregar Partido" />
            <AdminLink to="/agregar-competencia" text="Agregar Competencia" />
            {esAdminGlobal && (
              <AdminLink to="/agregar-organizacion" text="Agregar Organización" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLink({ to, text }) {
  return (
    <Link
      to={to}
      className="block w-full bg-slate-800 hover:bg-slate-700 text-white text-lg font-semibold py-4 px-6 rounded-lg text-center shadow transition-transform transform hover:scale-105"
    >
      {text}
    </Link>
  );
}

function SeccionEntidadConAgregar({ titulo, items, tipo, rutaAgregar, esAdminGlobal }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{titulo}</h2>
        <Link
          to={rutaAgregar}
          className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-full text-xl font-bold flex items-center justify-center"
          title={`Agregar ${tipo}`}
        >
          +
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item._id}
            to={`/${tipo}s/${item._id}`}
            className="block bg-gray-100 hover:bg-gray-200 p-4 rounded shadow text-gray-800"
          >
            <h3 className="text-lg font-bold">{item.nombre}</h3>
            {esAdminGlobal && (
              <p className="text-sm text-gray-500">ID: {item._id}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
