// src/components/features/admin/competencias/GestionCompetencias.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, FilterControls, Spinner } from '../../../ui';
import CompetenciaAdminCard from './CompetenciaAdminCard';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';
import { formatNumber } from '../../../../utils/formatters';

/**
 * Componente para gestión de competencias en administración
 */
const GestionCompetencias = () => {
  const { user, rol, token } = useAuth();
  const { get, del, loading } = useApi();
  const [competencias, setCompetencias] = useState([]);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Cargar competencias
  useEffect(() => {
    cargarCompetencias();
  }, []);

  // Verificar permisos de admin
  if (!rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para gestionar competencias</p>
      </Card>
    );
  }

  const cargarCompetencias = async () => {
    try {
      const data = await get('/api/competencias/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompetencias(data || []);
    } catch (err) {
      console.error('Error cargando competencias:', err);
    }
  };

  // Filtrar competencias
  const competenciasFiltradas = competencias.filter(competencia => {
    const estadoMatch = filtroEstado === 'todas' || competencia.estado === filtroEstado;
    const tipoMatch = filtroTipo === 'todos' || competencia.tipo === filtroTipo;
    return estadoMatch && tipoMatch;
  });

  // Estadísticas rápidas
  const estadisticas = {
    total: competencias.length,
    activas: competencias.filter(c => c.estado === 'activa').length,
    finalizadas: competencias.filter(c => c.estado === 'finalizada').length,
    equiposTotal: competencias.reduce((acc, c) => acc + (c.equipos?.length || 0), 0)
  };

  // Configuración de filtros
  const filters = [
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todas', label: 'Todas las competencias' },
        { value: 'activa', label: 'Activas' },
        { value: 'finalizada', label: 'Finalizadas' },
        { value: 'programada', label: 'Programadas' },
        { value: 'cancelada', label: 'Canceladas' }
      ]
    },
    {
      key: 'tipo',
      label: 'Tipo',
      value: filtroTipo,
      options: [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'liga', label: 'Liga' },
        { value: 'torneo', label: 'Torneo' },
        { value: 'copa', label: 'Copa' }
      ]
    }
  ];

  const handleCompetenciaEdit = (competenciaId) => {
    // Aquí se abriría el modal de edición
    console.log('Editando competencia:', competenciaId);
  };

  const handleCompetenciaDelete = async (competenciaId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta competencia?')) {
      try {
        await del(`/api/competencias/${competenciaId}`);
        await cargarCompetencias();
      } catch (err) {
        console.error('Error eliminando competencia:', err);
      }
    }
  };

  const handleCompetenciaView = (competenciaId) => {
    setCompetenciaSeleccionada(competencias.find(c => c._id === competenciaId));
  };

  if (loading && competencias.length === 0) {
    return <Spinner size="lg" message="Cargando competencias..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Competencias ({formatNumber(competenciasFiltradas.length)})
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Administración de competencias del sistema
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="success">
              {formatNumber(estadisticas.activas)} activas
            </Badge>
            <Badge variant="primary">
              {formatNumber(estadisticas.equiposTotal)} equipos
            </Badge>
            <Button variant="primary">
              ➕ Nueva Competencia
            </Button>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <FilterControls
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === 'estado') setFiltroEstado(value);
          if (key === 'tipo') setFiltroTipo(value);
        }}
        onClearFilters={() => {
          setFiltroEstado('todas');
          setFiltroTipo('todos');
        }}
      />

      {/* Grid de competencias */}
      {competenciasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competenciasFiltradas.map((competencia) => (
            <CompetenciaAdminCard
              key={competencia._id}
              competencia={competencia}
              onView={() => handleCompetenciaView(competencia._id)}
              onEdit={() => handleCompetenciaEdit(competencia._id)}
              onDelete={() => handleCompetenciaDelete(competencia._id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay competencias
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {competencias.length === 0
                ? 'No hay competencias registradas en el sistema.'
                : 'No se encontraron competencias con los filtros aplicados.'}
            </p>
            <Button variant="primary">
              Crear Primera Competencia
            </Button>
          </div>
        </Card>
      )}

      {/* Información adicional */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas.total}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticas.activas}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Activas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {estadisticas.finalizadas}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Finalizadas</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GestionCompetencias;
