import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

import ModalJugadorAdmin from './Admin/AdminJugador/ModalJugadorAdmin';
import ModalEquipoAdmin from './Admin/AdminEquipo/ModalEquipoAdmin';
import ModalOrganizacionAdmin from './Admin/AdminOrganizacion/ModalOrganizacionAdmin';
import ModalPartidoAdmin from './Admin/AdminPartido/ModalPartidoAdmin';
import ModalCompetenciaAdmin from './Admin/AdminCompetencia/ModalCompetenciaAdmin';

export default function PanelAdmin() {
  const { user } = useAuth();

  const [jugadores, setJugadores] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [organizaciones, setOrganizaciones] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para modales, guardamos el id seleccionado y el tipo para saber qué modal mostrar
  const [modalActivo, setModalActivo] = useState({ tipo: null, id: null });

  const [token, setToken] = useState(null);

  const esAdminGlobal = user?.rol === 'admin';

  useEffect(() => {
    if (!user) return;

    const cargarDatos = async () => {
      try {
        const t = await user.getIdToken();
        setToken(t);

        const [
          resJugadores,
          resEquipos,
          resOrganizaciones,
          resPartidos,
          resCompetencias,
        ] = await Promise.all([
          fetch('https://overtime-ddyl.onrender.com/api/jugadores/admin', { headers: { Authorization: `Bearer ${t}` } }),
          fetch('https://overtime-ddyl.onrender.com/api/equipos/admin', { headers: { Authorization: `Bearer ${t}` } }),
          fetch('https://overtime-ddyl.onrender.com/api/organizaciones/admin', { headers: { Authorization: `Bearer ${t}` } }),
          fetch('https://overtime-ddyl.onrender.com/api/partidos/admin', { headers: { Authorization: `Bearer ${t}` } }),
          fetch('https://overtime-ddyl.onrender.com/api/competencias/admin', { headers: { Authorization: `Bearer ${t}` } }),
        ]);

        setJugadores(await resJugadores.json());
        setEquipos(await resEquipos.json());
        setOrganizaciones(await resOrganizaciones.json());
        setPartidos(await resPartidos.json());
        setCompetencias(await resCompetencias.json());
      } catch (error) {
        console.error('Error al cargar datos administrativos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user]);

  // Abrir modal
  const abrirModal = (tipo, id) => {
    setModalActivo({ tipo, id });
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalActivo({ tipo: null, id: null });
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 p-4 sm:p-8 bg-white rounded-xl shadow-lg relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <Link to="/admin/opciones" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
          <span className="material-icons">settings</span> Opciones avanzadas
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
            onItemClick={(id) => abrirModal('jugador', id)}
          />
          <SeccionEntidadConAgregar
            titulo="Equipos en control"
            items={equipos}
            tipo="equipo"
            rutaAgregar="/agregar-equipo"
            esAdminGlobal={esAdminGlobal}
            onItemClick={(id) => abrirModal('equipo', id)}
          />
          <SeccionEntidadConAgregar
            titulo="Organizaciones en control"
            items={organizaciones}
            tipo="organizacion"
            rutaAgregar="/agregar-organizacion"
            esAdminGlobal={esAdminGlobal}
            onItemClick={(id) => abrirModal('organizacion', id)}
          />
          <SeccionEntidadConAgregar
            titulo="Partidos en control"
            items={partidos}
            tipo="partido"
            rutaAgregar="/agregar-partido"
            esAdminGlobal={esAdminGlobal}
            onItemClick={(id) => abrirModal('partido', id)}
          />
          <SeccionEntidadConAgregar
            titulo="Administrador de Competencias"
            items={competencias}
            tipo="competencia"
            rutaAgregar="/agregar-competencia"
            esAdminGlobal={esAdminGlobal}
            onItemClick={(id) => abrirModal('competencia', id)}
          />
        </div>
      )}

      {/* Modales */}
      {modalActivo.tipo === 'jugador' && modalActivo.id && token && (
        <ModalJugadorAdmin jugadorId={modalActivo.id} token={token} onClose={cerrarModal} />
      )}
      {modalActivo.tipo === 'equipo' && modalActivo.id && token && (
        <ModalEquipoAdmin equipoId={modalActivo.id} token={token} onClose={cerrarModal} />
      )}
      {modalActivo.tipo === 'organizacion' && modalActivo.id && token && (
        <ModalOrganizacionAdmin organizacionId={modalActivo.id} token={token} onClose={cerrarModal} />
      )}
      {modalActivo.tipo === 'partido' && modalActivo.id && token && (
        <ModalPartidoAdmin partidoId={modalActivo.id} token={token} onClose={cerrarModal} />
      )}
      {modalActivo.tipo === 'competencia' && modalActivo.id && token && (
        <ModalCompetenciaAdmin competenciaId={modalActivo.id} token={token} onClose={cerrarModal} />
      )}
    </div>
  );
}

function SeccionEntidadConAgregar({ titulo, items, tipo, rutaAgregar, esAdminGlobal, onItemClick }) {
  if (!items.length) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{titulo}</h2>
        <Link
          to={rutaAgregar}
          className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md text-lg font-semibold flex items-center justify-center shadow-md transition-transform transform hover:scale-105"
          title={`Agregar ${tipo}`}
        >
          <span className="material-icons">add</span>
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) =>
          onItemClick ? (
            <div
              key={item._id}
              onClick={() => onItemClick(item._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onItemClick(item._id);
              }}
              className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-4 rounded shadow text-gray-800"
            >
              <h3 className="text-lg font-bold">{item.nombre || item.titulo || `ID: ${item._id}`}</h3>
              {esAdminGlobal && <p className="text-sm text-gray-500">ID: {item._id}</p>}
            </div>
          ) : (
            <Link
              key={item._id}
              to={`/${tipo}s/${item._id}`}
              className="block bg-gray-100 hover:bg-gray-200 p-4 rounded shadow text-gray-800"
            >
              <h3 className="text-lg font-bold">{item.nombre || item.titulo || `ID: ${item._id}`}</h3>
              {esAdminGlobal && <p className="text-sm text-gray-500">ID: {item._id}</p>}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
