// src/components/features/admin/jugadores/GestionJugadoresAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, FilterControls, Spinner } from '../../../ui';
import UsuarioCard from '../../usuarios/components/UsuarioCard';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';
import { ITEMS_PER_PAGE } from '../../../../utils/constants';
import { formatNumber } from '../../../../utils/formatters';
import { ModalJugadorAdmin } from './components'; // Added import for ModalJugadorAdmin

/**
 * Componente para gestión de jugadores en administración
 */
const GestionJugadoresAdmin = () => {
  const { user, rol, token } = useAuth();
  const { get, del, loading } = useApi();
  const [jugadores, setJugadores] = useState([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [modalJugadorAdminAbierto, setModalJugadorAdminAbierto] = useState(false); // New state
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroEquipo, setFiltroEquipo] = useState('todos');
  const [orden, setOrden] = useState('nombre_asc');
  const [paginaActual, setPaginaActual] = useState(1);

  // Cargar datos iniciales
  useEffect(() => {
    cargarJugadores();
  }, []);

  const cargarJugadores = async () => {
    try {
      const data = await get('/api/jugadores/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJugadores(data || []);
    } catch (err) {
      console.error('Error cargando jugadores:', err);
    }
  };

  // Filtrar y ordenar jugadores
  const jugadoresFiltrados = useMemo(() => {
    let filtered = [...jugadores];

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(j => j.estado === filtroEstado);
    }

    // Filtro por equipo
    if (filtroEquipo !== 'todos') {
      filtered = filtered.filter(j => j.equipoActual === filtroEquipo);
    }

    // Ordenar
    filtered.sort((a, b) => {
      const aVal = a.nombre + ' ' + a.apellido;
      const bVal = b.nombre + ' ' + b.apellido;

      if (orden === 'nombre_asc') {
        return aVal.localeCompare(bVal);
      } else if (orden === 'nombre_desc') {
        return bVal.localeCompare(aVal);
      } else if (orden === 'fecha_asc') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (orden === 'fecha_desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    return filtered;
  }, [jugadores, filtroEstado, filtroEquipo, orden]);

  // Paginación
  const totalPaginas = Math.ceil(jugadoresFiltrados.length / ITEMS_PER_PAGE);
  const jugadoresPaginados = jugadoresFiltrados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Verificar permisos de admin
  if (!rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para gestionar jugadores</p>
      </Card>
    );
  }

  // Opciones de filtros
  const opcionesEstados = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' },
    { value: 'suspendido', label: 'Suspendidos' }
  ];

  const opcionesEquipos = [
    { value: 'todos', label: 'Todos los equipos' },
    // Aquí se cargarían dinámicamente los equipos disponibles
    { value: 'libre', label: 'Sin equipo' }
  ];

  const opcionesOrden = [
    { value: 'nombre_asc', label: 'Nombre A-Z' },
    { value: 'nombre_desc', label: 'Nombre Z-A' },
    { value: 'fecha_asc', label: 'Más antiguos' },
    { value: 'fecha_desc', label: 'Más recientes' }
  ];

  const handleJugadorEdit = (jugadorId) => {
    setJugadorSeleccionado(jugadores.find(j => j._id === jugadorId));
    setModalJugadorAdminAbierto(true); // Open modal
  };

  const handleJugadorDelete = async (jugadorId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
      try {
        await del(`/api/jugadores/${jugadorId}`);
        cargarJugadores();
      } catch (err) {
        console.error('Error eliminando jugador:', err);
      }
    }
  };

  const handleModalJugadorAdminClose = () => {
    setModalJugadorAdminAbierto(false);
    setJugadorSeleccionado(null);
    cargarJugadores(); // Recargar lista después de cambios
  };

  return (
    <>
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Jugadores
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {formatNumber(jugadoresFiltrados.length)} jugadores registrados
            </p>
          </div>
          <Badge variant="primary" size="lg">
            Panel Admin
          </Badge>
        </div>
      </Card>

      {/* Filtros y controles */}
      <Card>
        <FilterControls
          filters={[
            {
              key: 'estado',
              label: 'Estado',
              value: filtroEstado,
              onChange: setFiltroEstado,
              options: opcionesEstados
            },
            {
              key: 'equipo',
              label: 'Equipo',
              value: filtroEquipo,
              onChange: setFiltroEquipo,
              options: opcionesEquipos
            },
            {
              key: 'orden',
              label: 'Ordenar por',
              value: orden,
              onChange: setOrden,
              options: opcionesOrden
            }
          ]}
          onReset={() => {
            setFiltroEstado('todos');
            setFiltroEquipo('todos');
            setOrden('nombre_asc');
            setPaginaActual(1);
          }}
        />
      </Card>

      {/* Lista de jugadores */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <div className="text-center py-8">
              <Spinner size="lg" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Cargando jugadores...
              </p>
            </div>
          </Card>
        ) : jugadoresPaginados.length > 0 ? (
          jugadoresPaginados.map((jugador) => (
            <UsuarioCard
              key={jugador._id}
              usuario={jugador}
              tipo="jugador"
              onEdit={() => handleJugadorEdit(jugador._id)}
              onDelete={() => handleJugadorDelete(jugador._id)}
              showActions={true}
            />
          ))
        ) : (
          <Card>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No se encontraron jugadores con los filtros aplicados
            </div>
          </Card>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <Card>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
            >
              Anterior
            </Button>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {paginaActual} de {totalPaginas}
            </span>

            <Button
              variant="outline"
              onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </Button>
          </div>
        </Card>
      )}

      {/* Modal de administración de jugador */}
      {modalJugadorAdminAbierto && jugadorSeleccionado && (
        <ModalJugadorAdmin
          jugadorId={jugadorSeleccionado._id}
          token={token}
          onClose={handleModalJugadorAdminClose}
        />
      )}
    </>
  );
};

export default GestionJugadoresAdmin;
