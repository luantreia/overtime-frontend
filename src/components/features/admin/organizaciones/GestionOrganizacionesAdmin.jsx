// src/components/features/admin/organizaciones/GestionOrganizacionesAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, FilterControls, Spinner } from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';
import { formatNumber } from '../../../../utils/formatters';

/**
 * Componente para gestión de organizaciones en administración
 */
const GestionOrganizacionesAdmin = () => {
  const { user } = useAuth();
  const { get, del, loading } = useApi();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [organizacionSeleccionada, setOrganizacionSeleccionada] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Verificar permisos de admin
  if (!user?.rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para gestionar organizaciones</p>
      </Card>
    );
  }

  // Cargar organizaciones
  useEffect(() => {
    cargarOrganizaciones();
  }, []);

  const cargarOrganizaciones = async () => {
    try {
      const data = await get('/api/organizaciones/admin');
      setOrganizaciones(data || []);
    } catch (err) {
      console.error('Error cargando organizaciones:', err);
    }
  };

  // Filtrar organizaciones
  const organizacionesFiltradas = organizaciones.filter(organizacion => {
    const estadoMatch = filtroEstado === 'todas' ||
      (filtroEstado === 'activas' && organizacion.activa) ||
      (filtroEstado === 'inactivas' && !organizacion.activa);

    const tipoMatch = filtroTipo === 'todos' ||
      (organizacion.tipo === filtroTipo);

    return estadoMatch && tipoMatch;
  });

  // Estadísticas rápidas
  const estadisticas = {
    total: organizaciones.length,
    activas: organizaciones.filter(o => o.activa).length,
    conCompetencias: organizaciones.filter(o => o.competencias?.length > 0).length,
    conEquipos: organizaciones.filter(o => o.equipos?.length > 0).length
  };

  // Configuración de filtros
  const filters = [
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todas', label: 'Todas las organizaciones' },
        { value: 'activas', label: 'Activas' },
        { value: 'inactivas', label: 'Inactivas' }
      ]
    },
    {
      key: 'tipo',
      label: 'Tipo',
      value: filtroTipo,
      options: [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'federacion', label: 'Federación' },
        { value: 'liga', label: 'Liga' },
        { value: 'club', label: 'Club' },
        { value: 'asociacion', label: 'Asociación' }
      ]
    }
  ];

// src/components/features/admin/organizaciones/GestionOrganizacionesAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, FilterControls, Spinner } from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';
import { formatNumber } from '../../../../utils/formatters';
import { ModalOrganizacionAdmin } from './components';

/**
 * Componente para gestión de organizaciones en administración
 */
const GestionOrganizacionesAdmin = () => {
  const { user } = useAuth();
  const { get, del, loading } = useApi();
  const [organizaciones, setOrganizaciones] = useState([]);
  const [organizacionSeleccionada, setOrganizacionSeleccionada] = useState(null);
  const [modalOrganizacionAdminAbierto, setModalOrganizacionAdminAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Verificar permisos de admin
  if (!user?.rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para gestionar organizaciones</p>
      </Card>
    );
  }

  // Cargar organizaciones
  useEffect(() => {
    cargarOrganizaciones();
  }, []);

  const cargarOrganizaciones = async () => {
    try {
      const data = await get('/api/organizaciones/admin');
      setOrganizaciones(data || []);
    } catch (err) {
      console.error('Error cargando organizaciones:', err);
    }
  };

  // Filtrar organizaciones
  const organizacionesFiltradas = organizaciones.filter(organizacion => {
    const estadoMatch = filtroEstado === 'todas' ||
      (filtroEstado === 'activas' && organizacion.activa) ||
      (filtroEstado === 'inactivas' && !organizacion.activa);

    const tipoMatch = filtroTipo === 'todos' ||
      (organizacion.tipo === filtroTipo);

    return estadoMatch && tipoMatch;
  });

  // Estadísticas rápidas
  const estadisticas = {
    total: organizaciones.length,
    activas: organizaciones.filter(o => o.activa).length,
    conCompetencias: organizaciones.filter(o => o.competencias?.length > 0).length,
    conEquipos: organizaciones.filter(o => o.equipos?.length > 0).length
  };

  // Configuración de filtros
  const filters = [
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todas', label: 'Todas las organizaciones' },
        { value: 'activas', label: 'Activas' },
        { value: 'inactivas', label: 'Inactivas' }
      ]
    },
    {
      key: 'tipo',
      label: 'Tipo',
      value: filtroTipo,
      options: [
        { value: 'todos', label: 'Todos los tipos' },
        { value: 'federacion', label: 'Federación' },
        { value: 'liga', label: 'Liga' },
        { value: 'club', label: 'Club' },
        { value: 'asociacion', label: 'Asociación' }
      ]
    }
  ];

  const handleOrganizacionEdit = (organizacionId) => {
    setOrganizacionSeleccionada(organizaciones.find(o => o._id === organizacionId));
    setModalOrganizacionAdminAbierto(true);
  };

  const handleOrganizacionDelete = async (organizacionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta organización?')) {
      try {
        await del(`/api/organizaciones/${organizacionId}`);
        await cargarOrganizaciones();
      } catch (err) {
        console.error('Error eliminando organización:', err);
      }
    }
  };

  const handleOrganizacionView = (organizacionId) => {
    setOrganizacionSeleccionada(organizaciones.find(o => o._id === organizacionId));
  };

  const handleModalOrganizacionAdminClose = () => {
    setModalOrganizacionAdminAbierto(false);
    setOrganizacionSeleccionada(null);
    cargarOrganizaciones(); // Recargar lista después de cambios
  };

  // Función auxiliar para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && organizaciones.length === 0) {
    return <Spinner size="lg" message="Cargando organizaciones..." />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Organizaciones ({formatNumber(organizacionesFiltradas.length)})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Administración de organizaciones del sistema
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="success">
                {formatNumber(estadisticas.activas)} activas
              </Badge>
              <Badge variant="primary">
                {formatNumber(estadisticas.conCompetencias)} con competencias
              </Badge>
              <Button variant="primary">
                ➕ Nueva Organización
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

        {/* Grid de organizaciones */}
        {organizacionesFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizacionesFiltradas.map((organizacion) => (
              <Card key={organizacion._id} className="hover:shadow-lg transition-all duration-200">
                <div className="space-y-4">
                  {/* Header con nombre y estado */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {organizacion.nombre}
                    </h3>
                    <Badge variant={organizacion.activa ? 'success' : 'danger'}>
                      {organizacion.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>

                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                      <p className="font-medium capitalize">
                        {organizacion.tipo || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">País:</span>
                      <p className="font-medium">
                        {organizacion.pais || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {organizacion.competencias?.length || 0}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">Competencias</div>
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                        {organizacion.equipos?.length || 0}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">Equipos</div>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                        {organizacion.jugadores?.length || 0}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">Jugadores</div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Creada: {formatDate(organizacion.fechaCreacion)}
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOrganizacionView(organizacion._id)}>
                          Ver Detalles
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleOrganizacionEdit(organizacion._id)}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleOrganizacionDelete(organizacion._id)}>
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No hay organizaciones
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {organizaciones.length === 0
                  ? 'No hay organizaciones registradas en el sistema.'
                  : 'No se encontraron organizaciones con los filtros aplicados.'}
              </p>
              <Button variant="primary">
                Crear Primera Organización
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
                {estadisticas.activas}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {estadisticas.conCompetencias}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Con competencias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {estadisticas.conEquipos}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Con equipos</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de administración de organización */}
      {modalOrganizacionAdminAbierto && organizacionSeleccionada && (
        <ModalOrganizacionAdmin
          organizacionId={organizacionSeleccionada._id}
          token={user?.token}
          onClose={handleModalOrganizacionAdminClose}
        />
      )}
    </>
  );
};

export default GestionOrganizacionesAdmin;

  const handleOrganizacionDelete = async (organizacionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta organización?')) {
      try {
        await del(`/api/organizaciones/${organizacionId}`);
        await cargarOrganizaciones();
      } catch (err) {
        console.error('Error eliminando organización:', err);
      }
    }
  };

  const handleOrganizacionView = (organizacionId) => {
    setOrganizacionSeleccionada(organizaciones.find(o => o._id === organizacionId));
  };

  if (loading && organizaciones.length === 0) {
    return <Spinner size="lg" message="Cargando organizaciones..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Organizaciones ({formatNumber(organizacionesFiltradas.length)})
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Administración de organizaciones del sistema
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="success">
              {formatNumber(estadisticas.activas)} activas
            </Badge>
            <Badge variant="primary">
              {formatNumber(estadisticas.conCompetencias)} con competencias
            </Badge>
            <Button variant="primary">
              ➕ Nueva Organización
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

      {/* Grid de organizaciones */}
      {organizacionesFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizacionesFiltradas.map((organizacion) => (
            <Card key={organizacion._id} className="hover:shadow-lg transition-all duration-200">
              <div className="space-y-4">
                {/* Header con nombre y estado */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {organizacion.nombre}
                  </h3>
                  <Badge variant={organizacion.activa ? 'success' : 'danger'}>
                    {organizacion.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>

                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                    <p className="font-medium capitalize">
                      {organizacion.tipo || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">País:</span>
                    <p className="font-medium">
                      {organizacion.pais || 'No especificado'}
                    </p>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                      {organizacion.competencias?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Competencias</div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                      {organizacion.equipos?.length || 0}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Equipos</div>
                  </div>
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      {organizacion.jugadores?.length || 0}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Jugadores</div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Creada: {formatDate(organizacion.fechaCreacion)}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOrganizacionView(organizacion._id)}>
                        Ver Detalles
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleOrganizacionEdit(organizacion._id)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleOrganizacionDelete(organizacion._id)}>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay organizaciones
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {organizaciones.length === 0
                ? 'No hay organizaciones registradas en el sistema.'
                : 'No se encontraron organizaciones con los filtros aplicados.'}
            </p>
            <Button variant="primary">
              Crear Primera Organización
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
              {estadisticas.activas}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Activas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {estadisticas.conCompetencias}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Con competencias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {estadisticas.conEquipos}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Con equipos</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GestionOrganizacionesAdmin;
