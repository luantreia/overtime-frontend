// src/components/features/usuarios/GestionUsuarios.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, FilterControls, Spinner, Table } from '../../ui';
import UsuarioCard from './components/UsuarioCard';
import PerfilUsuario from './components/PerfilUsuario';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/api/useApi';
import { ITEMS_PER_PAGE, USER_ROLES } from '../../../utils/constants';
import { formatNumber } from '../../../utils/formatters';

/**
 * Componente principal para gestión de usuarios
 */
const GestionUsuarios = () => {
  const { user } = useAuth();
  const { get, post, put, del, loading } = useApi();
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);

  // Cargar usuarios (hooks primero)
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await get('/api/admin/usuarios');
      setUsuarios(data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = useMemo(() => {
    let filtered = usuarios;

    if (filtroRol) {
      filtered = filtered.filter(u => {
        const rolesArray = Array.isArray(u.rol) ? u.rol : [u.rol].filter(Boolean);
        return rolesArray.includes(filtroRol);
      });
    }

    if (filtroEstado === 'activos') {
      filtered = filtered.filter(u => u.activo);
    } else if (filtroEstado === 'inactivos') {
      filtered = filtered.filter(u => !u.activo);
    }

    return filtered;
  }, [usuarios, filtroRol, filtroEstado]);

  // Estadísticas rápidas
  const estadisticasUsuarios = useMemo(() => {
    const total = usuarios.length;
    const activos = usuarios.filter(u => u.activo).length;
    const admins = usuarios.filter(u => {
      const rolesArray = Array.isArray(u.rol) ? u.rol : [u.rol].filter(Boolean);
      return rolesArray.includes('admin');
    }).length;
    const moderadores = usuarios.filter(u => {
      const rolesArray = Array.isArray(u.rol) ? u.rol : [u.rol].filter(Boolean);
      return rolesArray.includes('moderador');
    }).length;

    return { total, activos, admins, moderadores };
  }, [usuarios]);

  // Paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE);
  const usuariosPagina = usuariosFiltrados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Configuración de filtros
  const filters = [
    {
      key: 'rol',
      label: 'Rol',
      value: filtroRol,
      options: [
        { value: '', label: 'Todos los roles' },
        { value: 'admin', label: 'Administradores' },
        { value: 'moderador', label: 'Moderadores' },
        { value: 'usuario', label: 'Usuarios' }
      ]
    },
    {
      key: 'estado',
      label: 'Estado',
      value: filtroEstado,
      options: [
        { value: 'todos', label: 'Todos los estados' },
        { value: 'activos', label: 'Activos' },
        { value: 'inactivos', label: 'Inactivos' }
      ]
    }
  ];

  // Verificar permisos de admin (después de los hooks)
  if (!user?.rol?.includes('admin')) {
    return (
      <Card variant="danger">
        <p>No tienes permisos para gestionar usuarios</p>
      </Card>
    );
  }

  const handleUsuarioEdit = async (usuarioId, datos) => {
    try {
      await put(`/api/admin/usuarios/${usuarioId}`, datos);
      await cargarUsuarios();
      setUsuarioSeleccionado(null);
    } catch (err) {
      console.error('Error actualizando usuario:', err);
    }
  };

  const handleUsuarioDelete = async (usuarioId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await del(`/api/admin/usuarios/${usuarioId}`);
        await cargarUsuarios();
      } catch (err) {
        console.error('Error eliminando usuario:', err);
      }
    }
  };

  if (loading && usuarios.length === 0) {
    return <Spinner size="lg" message="Cargando usuarios..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios ({formatNumber(usuariosFiltrados.length)})
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administración de usuarios del sistema
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="success">
              {formatNumber(estadisticasUsuarios.activos)} activos
            </Badge>
            <Badge variant="danger">
              {formatNumber(estadisticasUsuarios.admins)} admins
            </Badge>
          </div>
        </div>
      </Card>

      {/* Controles de filtro */}
      <FilterControls
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === 'rol') setFiltroRol(value);
          if (key === 'estado') setFiltroEstado(value);
          setPaginaActual(1);
        }}
        onClearFilters={() => {
          setFiltroRol('');
          setFiltroEstado('todos');
          setPaginaActual(1);
        }}
      />

      {/* Vista de tabla para desktop */}
      <div className="hidden lg:block">
        <Card title="Lista de Usuarios">
          <Table
            headers={['Usuario', 'Email', 'Rol', 'Estado', 'Último Acceso', 'Acciones']}
            data={usuariosPagina.map(usuario => ({
              usuario: (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()[0] || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Sin nombre'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {usuario._id?.slice(-8)}
                    </div>
                  </div>
                </div>
              ),
              email: usuario.email,
              rol: (
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(usuario.rol) ? (
                    usuario.rol.map((role, index) => (
                      <Badge
                        key={index}
                        variant={
                          role === 'admin' ? 'danger' :
                          role === 'moderador' ? 'warning' : 'secondary'
                        }
                        size="xs"
                      >
                        {role === 'admin' ? '👑 Admin' :
                         role === 'moderador' ? '⚖️ Moderador' : '👤 Usuario'}
                      </Badge>
                    ))
                  ) : (
                    <Badge
                      variant={
                        usuario.rol === 'admin' ? 'danger' :
                        usuario.rol === 'moderador' ? 'warning' : 'secondary'
                      }
                      size="xs"
                    >
                      {usuario.rol === 'admin' ? '👑 Admin' :
                       usuario.rol === 'moderador' ? '⚖️ Moderador' : '👤 Usuario'}
                    </Badge>
                  )}
                </div>
              ),
              estado: (
                <Badge variant={usuario.activo ? 'success' : 'danger'}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              ),
              ultimoAcceso: usuario.ultimoAcceso
                ? new Date(usuario.ultimoAcceso).toLocaleDateString()
                : 'Nunca',
              acciones: (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsuarioSeleccionado(usuario)}
                  >
                    Ver
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {/* Editar usuario */}}
                  >
                    Editar
                  </Button>
                </div>
              )
            }))}
          />
        </Card>
      </div>

      {/* Vista de tarjetas para móvil */}
      <div className="lg:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {usuariosPagina.map(usuario => (
            <UsuarioCard
              key={usuario._id}
              usuario={usuario}
              onClick={() => setUsuarioSeleccionado(usuario)}
              onEdit={() => {/* Editar usuario */}}
              onDelete={() => handleUsuarioDelete(usuario._id)}
            />
          ))}
        </div>
      </div>

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

      {/* Modal de perfil de usuario */}
      {usuarioSeleccionado && (
        <PerfilUsuario
          usuario={usuarioSeleccionado}
          onClose={() => setUsuarioSeleccionado(null)}
          onSave={(datos) => handleUsuarioEdit(usuarioSeleccionado._id, datos)}
        />
      )}
    </div>
  );
};

export default GestionUsuarios;
