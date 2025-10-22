// src/components/features/admin/PanelAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner } from '../../ui';
import AdminSeccionEntidades from './components/AdminSeccionEntidades';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/api/useApi';

/**
 * Panel de administración mejorado con navegación moderna
 */
const PanelAdmin = () => {
  const { user } = useAuth();
  const { get, loading } = useApi();
  const [activeSection, setActiveSection] = useState('jugadores');
  const [data, setData] = useState({
    jugadores: [],
    equipos: [],
    organizaciones: [],
    competencias: []
  });

  // Verificar permisos de admin
  if (!user?.rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos de administrador</p>
      </Card>
    );
  }

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosAdministrativos();
  }, []);

  const cargarDatosAdministrativos = async () => {
    try {
      const [jugadores, equipos, organizaciones, competencias] = await Promise.all([
        get('/api/jugadores/admin'),
        get('/api/equipos/admin'),
        get('/api/organizaciones/admin'),
        get('/api/competencias/admin')
      ]);

      setData({
        jugadores: jugadores || [],
        equipos: equipos || [],
        organizaciones: organizaciones || [],
        competencias: competencias || []
      });
    } catch (err) {
      console.error('Error cargando datos administrativos:', err);
    }
  };

  const secciones = [
    {
      id: 'jugadores',
      titulo: 'Jugadores en control',
      items: data.jugadores,
      tipo: 'jugador',
      rutaAgregar: '/agregar-jugadores-multiple'
    },
    {
      id: 'equipos',
      titulo: 'Equipos en control',
      items: data.equipos,
      tipo: 'equipo',
      rutaAgregar: '/agregar-equipo'
    },
    {
      id: 'competencias',
      titulo: 'Competencias en control',
      items: data.competencias,
      tipo: 'competencia',
      rutaAgregar: '/agregar-competencia'
    },
    {
      id: 'organizaciones',
      titulo: 'Organizaciones en control',
      items: data.organizaciones,
      tipo: 'organizacion',
      rutaAgregar: '/agregar-organizacion'
    }
  ];

  const seccionActiva = secciones.find(s => s.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header del panel */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Administración
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestión completa del sistema
            </p>
          </div>
          <Badge variant="primary" size="lg">
            Modo Admin
          </Badge>
        </div>
      </Card>

      {/* Navegación por secciones */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {secciones.map((seccion) => (
            <Button
              key={seccion.id}
              variant={activeSection === seccion.id ? 'primary' : 'outline'}
              onClick={() => setActiveSection(seccion.id)}
              className="h-auto py-4 flex flex-col items-center space-y-2"
            >
              <span className="text-2xl">
                {seccion.id === 'jugadores' ? '⚽' :
                 seccion.id === 'equipos' ? '🏆' :
                 seccion.id === 'competencias' ? '🏅' : '🏢'}
              </span>
              <span className="text-sm font-medium">
                {seccion.titulo.split(' ')[0]}
              </span>
              <Badge variant="secondary" size="xs">
                {seccion.items.length}
              </Badge>
            </Button>
          ))}
        </div>
      </Card>

      {/* Contenido de la sección activa */}
      {seccionActiva && (
        <AdminSeccionEntidades
          titulo={seccionActiva.titulo}
          tipo={seccionActiva.tipo}
          items={seccionActiva.items}
          onItemClick={(id) => {
            // Aquí se abriría el modal correspondiente
            console.log(`Abriendo modal de ${seccionActiva.tipo} con ID: ${id}`);
          }}
          rutaAgregar={seccionActiva.rutaAgregar}
          loading={loading}
        />
      )}

      {/* Información adicional */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Última actualización:</span>
            <p className="text-gray-600 dark:text-gray-400">
              {new Date().toLocaleString()}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Usuario administrador:</span>
            <p className="text-gray-600 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PanelAdmin;
