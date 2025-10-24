// src/components/features/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import AdminPanel from './shared/AdminPanel';
import AdminStats from './shared/AdminStats';
import AdminSeccionEntidades from './shared/AdminSeccionEntidades';
import { Card } from '../../ui';
import { useEquipos } from '../../../hooks/equipos/useEquipos';
import useJugadores from '../../../hooks/jugadores/useJugadores';
import { useCompetencias } from '../../../hooks/competencias/useCompetencias';
import { useOrganizaciones } from '../../../hooks/organizaciones/useOrganizaciones';
import { usePartidos } from '../../../hooks/partidos/usePartidos';
import { useAuth } from '../../../context/AuthContext';
import AdminDiagnostic from './AdminDiagnostic';

// Importar modales de administración
import { ModalEquipoAdmin } from './equipos/components';
import { ModalJugadorAdmin } from './jugadores/components';
import { ModalCompetenciaAdmin } from './competencias/components';
import { ModalOrganizacionAdmin } from './organizaciones/components';
import { ModalPartidoAdmin } from './partidos/components';

/**
 * Dashboard principal de administración
 */
const AdminDashboard = () => {
  const { user, rol, token } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({});

  // Estados para modales de administración
  const [modalEquipoAbierto, setModalEquipoAbierto] = useState(false);
  const [modalJugadorAbierto, setModalJugadorAbierto] = useState(false);
  const [modalCompetenciaAbierto, setModalCompetenciaAbierto] = useState(false);
  const [modalOrganizacionAbierto, setModalOrganizacionAbierto] = useState(false);
  const [modalPartidoAbierto, setModalPartidoAbierto] = useState(false);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);
  const {
    equipos,
    loading: loadingEquipos,
    error: errorEquipos,
    cargarEquipos
  } = useEquipos(token);

  const {
    jugadores,
    loading: loadingJugadores,
    error: errorJugadores
  } = useJugadores(token);

  const {
    competencias,
    loading: loadingCompetencias,
    error: errorCompetencias,
    cargarCompetencias
  } = useCompetencias();

  // Usar hook para organizaciones
  const {
    organizaciones,
    loading: loadingOrganizaciones,
    error: errorOrganizaciones
  } = useOrganizaciones();

  // Usar hook para partidos
  const {
    partidos,
    loading: loadingPartidos,
    error: errorPartidos
  } = usePartidos(token);

  // Helpers de filtrado por permisos (sin nuevas rutas)
  const esAdminGlobal = rol === 'admin';
  const extraerUid = (ref) => {
    if (!ref) return '';
    if (typeof ref === 'string') return ref;
    return ref.uid || ref._id || ref.id || '';
  };
  const esAdministrablePorUsuario = (entidad) => {
    if (esAdminGlobal) return true;
    const creador = extraerUid(entidad?.creadoPor);
    if (creador && creador === user?.uid) return true;
    const admins = Array.isArray(entidad?.administradores) ? entidad.administradores : [];
    return admins.some((a) => extraerUid(a) === user?.uid);
  };

  // Listas filtradas según permisos del usuario
  const equiposVisibles = esAdminGlobal ? equipos : equipos.filter(esAdministrablePorUsuario);
  const jugadoresVisibles = esAdminGlobal ? jugadores : jugadores.filter(esAdministrablePorUsuario);
  const partidosVisibles = esAdminGlobal ? partidos : partidos.filter(esAdministrablePorUsuario);
  const competenciasVisibles = esAdminGlobal ? competencias : competencias.filter(esAdministrablePorUsuario);
  const organizacionesVisibles = esAdminGlobal ? organizaciones : organizaciones.filter(esAdministrablePorUsuario);

  // Funciones para manejar modales
  const handleItemClick = (tipo, id) => {
    setEntidadSeleccionada(id);
    switch (tipo) {
      case 'equipo':
        setModalEquipoAbierto(true);
        break;
      case 'jugador':
        setModalJugadorAbierto(true);
        break;
      case 'competencia':
        setModalCompetenciaAbierto(true);
        break;
      case 'organizacion':
        setModalOrganizacionAbierto(true);
        break;
      case 'partido':
        setModalPartidoAbierto(true);
        break;
      default:
        console.log(`Funcionalidad no disponible para ${tipo} - ID: ${id}`);
    }
  };

  const handleModalClose = () => {
    setModalEquipoAbierto(false);
    setModalJugadorAbierto(false);
    setModalCompetenciaAbierto(false);
    setModalOrganizacionAbierto(false);
    setModalPartidoAbierto(false);
    setEntidadSeleccionada(null);
  };
  // Verificar que el usuario esté autenticado
  if (!token) {
    return (
      <Card variant="danger">
        <p>Debes iniciar sesión para acceder al panel de administración</p>
      </Card>
    );
  }

  // Definir secciones de administración
  const sections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      id: 'equipos',
      label: 'Equipos',
      icon: '🛡️',
      badge: { text: equiposVisibles.length, variant: 'primary' }
    },
    {
      id: 'jugadores',
      label: 'Jugadores',
      icon: '👟',
      badge: { text: jugadoresVisibles.length, variant: 'success' }
    },
    {
      id: 'partidos',
      label: 'Partidos',
      icon: '🏟️',
      badge: { text: partidosVisibles.length, variant: 'warning' }
    },
    {
      id: 'competencias',
      label: 'Competencias',
      icon: '🏅',
      badge: { text: competenciasVisibles.length, variant: 'info' }
    },
    {
      id: 'organizaciones',
      label: 'Organizaciones',
      icon: '🏢',
      badge: { text: organizacionesVisibles.length, variant: 'warning' }
    }
  ];

  if (esAdminGlobal) {
    sections.push(
      {
        id: 'usuarios',
        label: 'Usuarios',
        icon: '👥',
        badge: { text: stats.usuariosRegistrados || 0, variant: 'secondary' }
      },
      {
        id: 'diagnostic',
        label: 'Diagnóstico',
        icon: '🩺'
      }
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminStats 
          stats={stats}
          equipos={equiposVisibles}
          jugadores={jugadoresVisibles}
          partidos={partidosVisibles}
          competencias={competenciasVisibles}
          organizaciones={organizacionesVisibles}
        />;

      case 'equipos':
        return (
          <AdminSeccionEntidades
            titulo="Equipos en control"
            tipo="equipo"
            items={equiposVisibles}
            onItemClick={(id) => handleItemClick('equipo', id)}
            rutaAgregar="/agregar-equipo"
            loading={loadingEquipos}
          />
        );

      case 'jugadores':
        return (
          <AdminSeccionEntidades
            titulo="Jugadores en control"
            tipo="jugador"
            items={jugadoresVisibles}
            onItemClick={(id) => handleItemClick('jugador', id)}
            rutaAgregar="/agregar-jugadores-multiple"
            loading={loadingJugadores}
          />
        );

      case 'partidos':
        return (
          <AdminSeccionEntidades
            titulo="Partidos en control"
            tipo="partido"
            items={partidosVisibles}
            onItemClick={(id) => handleItemClick('partido', id)}
            rutaAgregar="/agregar-partido"
            loading={loadingPartidos}
          />
        );

      case 'competencias':
        return (
          <AdminSeccionEntidades
            titulo="Competencias en control"
            tipo="competencia"
            items={competenciasVisibles}
            onItemClick={(id) => handleItemClick('competencia', id)}
            rutaAgregar="/agregar-competencia"
            loading={loadingCompetencias}
          />
        );

      case 'organizaciones':
        return (
          <AdminSeccionEntidades
            titulo="Organizaciones en control"
            tipo="organizacion"
            items={organizacionesVisibles}
            onItemClick={(id) => handleItemClick('organizacion', id)}
            rutaAgregar="/agregar-organizacion"
            loading={loadingOrganizaciones}
          />
        );

      case 'usuarios':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Usuarios
              </h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  👤 Ver Usuarios
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  ⚙️ Configuración
                </button>
              </div>
            </div>

            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Componentes de usuarios en desarrollo...
            </div>
          </div>
        );

      case 'diagnostic':
        return <AdminDiagnostic />;

      default:
        return <AdminStats stats={stats} />;
    }
  };

  return (
    <>
      <AdminPanel
        title="Panel de Gestión"
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sections={sections}
      >
        {renderContent()}
      </AdminPanel>

      {/* Modales de administración */}
      {modalEquipoAbierto && entidadSeleccionada && (
        <ModalEquipoAdmin
          equipoId={entidadSeleccionada}
          token={token}
          onClose={handleModalClose}
        />
      )}

      {modalJugadorAbierto && entidadSeleccionada && (
        <ModalJugadorAdmin
          jugadorId={entidadSeleccionada}
          token={token}
          onClose={handleModalClose}
        />
      )}

      {modalCompetenciaAbierto && entidadSeleccionada && (
        <ModalCompetenciaAdmin
          competenciaId={entidadSeleccionada}
          token={token}
          onClose={handleModalClose}
        />
      )}

      {modalOrganizacionAbierto && entidadSeleccionada && (
        <ModalOrganizacionAdmin
          organizacionId={entidadSeleccionada}
          token={token}
          onClose={handleModalClose}
        />
      )}

      {modalPartidoAbierto && entidadSeleccionada && (
        <ModalPartidoAdmin
          partidoId={entidadSeleccionada}
          token={token}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default AdminDashboard;
