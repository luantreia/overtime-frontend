// src/components/features/notificaciones/components/ListaNotificaciones.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Select, Spinner } from '../../../ui';
import NotificacionCard from './NotificacionCard';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';
import { formatNumber } from '../../../../utils/formatters';

/**
 * Componente ListaNotificaciones para mostrar todas las notificaciones del usuario
 */
const ListaNotificaciones = () => {
  const { user } = useAuth();
  const { get, put, del, loading } = useApi();
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [paginaActual, setPaginaActual] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // Cargar notificaciones
  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const data = await get('/api/notificaciones');
      setNotificaciones(data);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    }
  };

  // Filtrar notificaciones
  const notificacionesFiltradas = React.useMemo(() => {
    let filtered = notificaciones;

    if (filtroTipo !== 'todas') {
      filtered = filtered.filter(n => n.tipo === filtroTipo);
    }

    if (filtroEstado === 'leidas') {
      filtered = filtered.filter(n => n.leida);
    } else if (filtroEstado === 'no-leidas') {
      filtered = filtered.filter(n => !n.leida);
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  }, [notificaciones, filtroTipo, filtroEstado]);

  const totalPaginas = Math.ceil(notificacionesFiltradas.length / ITEMS_PER_PAGE);
  const notificacionesPagina = notificacionesFiltradas.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Estadísticas de notificaciones
  const estadisticas = React.useMemo(() => {
    const total = notificaciones.length;
    const leidas = notificaciones.filter(n => n.leida).length;
    const noLeidas = total - leidas;
    const urgentes = notificaciones.filter(n => n.prioridad === 'urgente').length;

    return { total, leidas, noLeidas, urgentes };
  }, [notificaciones]);

  const handleMarkAsRead = async (notificacionId) => {
    try {
      await put(`/api/notificaciones/${notificacionId}/leer`);
      await cargarNotificaciones();
    } catch (err) {
      console.error('Error marcando notificación como leída:', err);
    }
  };

  const handleDelete = async (notificacionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      try {
        await del(`/api/notificaciones/${notificacionId}`);
        await cargarNotificaciones();
      } catch (err) {
        console.error('Error eliminando notificación:', err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await put('/api/notificaciones/leer-todas');
      await cargarNotificaciones();
    } catch (err) {
      console.error('Error marcando todas como leídas:', err);
    }
  };

  if (loading && notificaciones.length === 0) {
    return <Spinner size="lg" message="Cargando notificaciones..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notificaciones ({formatNumber(notificacionesFiltradas.length)})
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Centro de notificaciones del usuario
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="info">
              {formatNumber(estadisticas.noLeidas)} nuevas
            </Badge>
            <Badge variant="danger">
              {formatNumber(estadisticas.urgentes)} urgentes
            </Badge>
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Marcar todas como leídas
            </Button>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Tipo de notificación"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            options={[
              { value: 'todas', label: 'Todas las notificaciones' },
              { value: 'info', label: 'Información' },
              { value: 'success', label: 'Éxito' },
              { value: 'warning', label: 'Advertencia' },
              { value: 'error', label: 'Error' }
            ]}
          />

          <Select
            label="Estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: 'todas', label: 'Todas' },
              { value: 'no-leidas', label: 'No leídas' },
              { value: 'leidas', label: 'Leídas' }
            ]}
          />

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFiltroTipo('todas');
                setFiltroEstado('todas');
                setPaginaActual(1);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de notificaciones */}
      {notificacionesPagina.length > 0 ? (
        <div className="space-y-4">
          {notificacionesPagina.map((notificacion) => (
            <NotificacionCard
              key={notificacion._id}
              notificacion={notificacion}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {notificaciones.length === 0
                ? 'No tienes notificaciones en este momento.'
                : 'No se encontraron notificaciones con los filtros aplicados.'}
            </p>
          </div>
        </Card>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
            <Button
              key={numero}
              variant={numero === paginaActual ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPaginaActual(numero)}
            >
              {numero}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaNotificaciones;
