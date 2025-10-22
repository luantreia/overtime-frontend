// src/components/features/admin/partidos/GestionPartidosAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, FilterControls, Spinner } from '../../../ui';
import PartidoCard from '../../partidos/components/PartidoCard';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';
import { formatNumber } from '../../../../utils/formatters';
import { ModalPartidoAdmin } from './components';

/**
 * Componente para gestión de partidos en administración
 */
const GestionPartidosAdmin = () => {
  const { user } = useAuth();
  const { get, del, loading } = useApi();
  const [partidos, setPartidos] = useState([]);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const [modalPartidoAdminAbierto, setModalPartidoAdminAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCompetencia, setFiltroCompetencia] = useState('todos');

  // Cargar partidos
  useEffect(() => {
    cargarPartidos();
  }, []);

  // Verificar permisos de admin
  if (!user?.rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para gestionar partidos</p>
      </Card>
    );
  }

  const cargarPartidos = async () => {
    try {
      const data = await get('/api/partidos/admin');
      setPartidos(data || []);
    } catch (err) {
      console.error('Error cargando partidos:', err);
    }
  };

  // Filtrar partidos
  const partidosFiltrados = partidos.filter(partido => {
    const estadoMatch = filtroEstado === 'todos' || partido.estado === filtroEstado;
    const competenciaMatch = filtroCompetencia === 'todos' ||
      (partido.competencia?._id === filtroCompetencia);

    return estadoMatch && competenciaMatch;
  });

  // Estadísticas rápidas
  const estadisticas = {
    total: partidos.length,
    programados: partidos.filter(p => p.estado === 'programado').length,
    enVivo: partidos.filter(p => p.estado === 'en_juego').length,
    finalizados: partidos.filter(p => p.estado === 'finalizado').length,
    cancelados: partidos.filter(p => p.estado === 'cancelado').length
  };

  // Obtener competencias únicas para filtro
  const competenciasUnicas = [...new Set(partidos.map(p => p.competencia).filter(Boolean))];

  // Configuración de filtros
  const filters = [
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todos', label: 'Todos los partidos' },
        { value: 'programado', label: 'Programados' },
        { value: 'en_juego', label: 'En vivo' },
        { value: 'finalizado', label: 'Finalizados' },
        { value: 'cancelado', label: 'Cancelados' }
      ]
    },
    {
      key: 'competencia',
      label: 'Competencia',
      value: filtroCompetencia,
      options: [
        { value: 'todos', label: 'Todas las competencias' },
        ...competenciasUnicas.map(competencia => ({
          value: competencia._id,
          label: competencia.nombre
        }))
      ]
    }
  ];

  const handlePartidoEdit = (partidoId) => {
    setPartidoSeleccionado(partidos.find(p => p._id === partidoId));
    setModalPartidoAdminAbierto(true);
  };

  const handlePartidoDelete = async (partidoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este partido?')) {
      try {
        await del(`/api/partidos/${partidoId}`);
        await cargarPartidos();
      } catch (err) {
        console.error('Error eliminando partido:', err);
      }
    }
  };

  const handlePartidoView = (partidoId) => {
    setPartidoSeleccionado(partidos.find(p => p._id === partidoId));
  };

  const handleModalPartidoAdminClose = () => {
    setModalPartidoAdminAbierto(false);
    setPartidoSeleccionado(null);
    cargarPartidos(); // Recargar lista después de cambios
  };

  const handlePartidoEliminado = (partidoId) => {
    setModalPartidoAdminAbierto(false);
    setPartidoSeleccionado(null);
    cargarPartidos(); // Recargar lista después de eliminación
  };

  if (loading && partidos.length === 0) {
    return <Spinner size="lg" message="Cargando partidos..." />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header con estadísticas */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Partidos ({formatNumber(partidosFiltrados.length)})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Administración de partidos del sistema
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="warning">
                {formatNumber(estadisticas.programados)} programados
              </Badge>
              <Badge variant="success">
                {formatNumber(estadisticas.enVivo)} en vivo
              </Badge>
              <Badge variant="primary">
                {formatNumber(estadisticas.finalizados)} finalizados
              </Badge>
              <Button variant="primary">
                ➕ Nuevo Partido
              </Button>
            </div>
          </div>
        </Card>

        {/* Filtros */}
        <FilterControls
          filters={filters}
          onFilterChange={(key, value) => {
            if (key === 'estado') setFiltroEstado(value);
            if (key === 'competencia') setFiltroCompetencia(value);
          }}
          onClearFilters={() => {
            setFiltroEstado('todos');
            setFiltroCompetencia('todos');
          }}
        />

        {/* Grid de partidos */}
        {partidosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partidosFiltrados.map((partido) => (
              <PartidoCard
                key={partido._id}
                partido={partido}
                user={user}
                onClick={() => handlePartidoView(partido._id)}
                onAdminClick={() => handlePartidoEdit(partido._id)}
                onDeleteClick={() => handlePartidoDelete(partido._id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏟️</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No hay partidos
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {partidos.length === 0
                  ? 'No hay partidos registrados en el sistema.'
                  : 'No se encontraron partidos con los filtros aplicados.'}
              </p>
              <Button variant="primary">
                Crear Primer Partido
              </Button>
            </div>
          </Card>
        )}

        {/* Información adicional */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {estadisticas.total}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {estadisticas.programados}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Programados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estadisticas.enVivo}
              </div>
              <div className="text-gray-600 dark:text-gray-400">En vivo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {estadisticas.finalizados}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Finalizados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {estadisticas.cancelados}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Cancelados</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de administración de partido */}
      {modalPartidoAdminAbierto && partidoSeleccionado && (
        <ModalPartidoAdmin
          partidoId={partidoSeleccionado._id}
          token={user?.token}
          onClose={handleModalPartidoAdminClose}
          onPartidoEliminado={handlePartidoEliminado}
        />
      )}
    </>
  );
};

export default GestionPartidosAdmin;
