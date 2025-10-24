// src/components/features/admin/equipos/EquipoAdminPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, FilterControls, Spinner } from '../../../ui';
import EquipoAdminCard from '../shared/EquipoAdminCard';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';
import { formatNumber } from '../../../../utils/formatters';
import { ModalEquipoAdmin } from './components';

/**
 * Componente para gestión de equipos en administración
 */
const EquipoAdminPage = () => {
  const { user, rol, token } = useAuth();
  const { get, del, loading } = useApi();

  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [modalEquipoAdminAbierto, setModalEquipoAdminAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Cargar equipos
  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      console.log('🔄 Cargando equipos con token:', token);
      const data = await get('/api/equipos/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Datos de equipos recibidos:', data);
      setEquipos(data || []);
    } catch (err) {
      console.error('❌ Error cargando equipos:', err);
    }
  };

  // Filtrar equipos
  const equiposFiltrados = useMemo(() => {
    console.log('🔍 Filtrando equipos:', {
      totalEquipos: equipos.length,
      filtroEstado,
      filtroTipo,
      equipos
    });
    
    let filtered = [...equipos];

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(equipo => {
        const estadoMatch = filtroEstado === 'activos' && equipo.estaActivo ||
          (filtroEstado === 'inactivos' && !equipo.estaActivo);
        return estadoMatch;
      });
    }

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(equipo => {
        const tipoMatch = filtroTipo === 'selecciones' && equipo.esSeleccionNacional ||
          (filtroTipo === 'clubes' && !equipo.esSeleccionNacional);
        return tipoMatch;
      });
    }

    console.log('✅ Equipos filtrados:', filtered.length);
    return filtered;
  }, [equipos, filtroEstado, filtroTipo]);

  // Estadísticas rápidas
  const estadisticas = {
    total: equipos.length,
    activos: equipos.filter(e => e.estaActivo).length,
    selecciones: equipos.filter(e => e.esSeleccionNacional).length,
    clubes: equipos.filter(e => !e.esSeleccionNacional).length,
    jugadoresTotal: equipos.reduce((acc, e) => acc + (e.jugadores?.length || 0), 0)
  };

  // Configuración de filtros
  const filters = [
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todos', label: 'Todos los equipos' },
        { value: 'activos', label: 'Activos' },
        { value: 'inactivos', label: 'Inactivos' }
      ]
    },
    {
      key: 'tipo',
      label: 'Tipo',
      value: filtroTipo,
      options: [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'selecciones', label: 'Selecciones' },
        { value: 'clubes', label: 'Clubes' }
      ]
    }
  ];

  const handleEquipoEdit = (equipoId) => {
    setEquipoSeleccionado(equipos.find(e => e._id === equipoId));
    setModalEquipoAdminAbierto(true);
  };

  const handleEquipoDelete = async (equipoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      try {
        await del(`/api/equipos/${equipoId}`);
        await cargarEquipos();
      } catch (err) {
        console.error('Error eliminando equipo:', err);
      }
    }
  };

  const handleEquipoView = (equipoId) => {
    setEquipoSeleccionado(equipos.find(e => e._id === equipoId));
  };

  const handleModalEquipoAdminClose = () => {
    setModalEquipoAdminAbierto(false);
    setEquipoSeleccionado(null);
    cargarEquipos(); // Recargar lista después de cambios
  };

  if (loading && equipos.length === 0) {
    return <Spinner size="lg" message="Cargando equipos..." />;
  }

  // Verificar permisos de admin
  if (!rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para gestionar equipos</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Equipos ({formatNumber(equiposFiltrados.length)})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Administración de equipos del sistema
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="success">
                {formatNumber(estadisticas.activos)} activos
              </Badge>
              <Badge variant="primary">
                {formatNumber(estadisticas.selecciones)} selecciones
              </Badge>
              <Badge variant="warning">
                {formatNumber(estadisticas.clubes)} clubes
              </Badge>
              <Button variant="primary">
                ➕ Nuevo Equipo
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
            setFiltroEstado('todos');
            setFiltroTipo('todos');
          }}
        />

        {/* Grid de equipos */}
        {equiposFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equiposFiltrados.map((equipo) => (
              <EquipoAdminCard
                key={equipo._id}
                equipo={equipo}
                user={user}
                onClick={() => handleEquipoView(equipo._id)}
                onEditClick={() => handleEquipoEdit(equipo._id)}
                onDeleteClick={() => handleEquipoDelete(equipo._id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No hay equipos
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {equipos.length === 0
                  ? 'No hay equipos registrados en el sistema.'
                  : 'No se encontraron equipos con los filtros aplicados.'}
              </p>
              <Button variant="primary">
                Crear Primer Equipo
              </Button>
            </div>
          </Card>
        )}

        {/* Información adicional */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {estadisticas.total}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estadisticas.activos}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {estadisticas.jugadoresTotal}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Jugadores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {equipos.filter(e => e.estaActivo && e.estadisticas?.totalPartidos > 0).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Con actividad</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de administración de equipo */}
      {modalEquipoAdminAbierto && equipoSeleccionado && (
        <ModalEquipoAdmin
          equipoId={equipoSeleccionado._id}
          token={token}
          onClose={handleModalEquipoAdminClose}
        />
      )}
    </>
  );
};

export default EquipoAdminPage;
