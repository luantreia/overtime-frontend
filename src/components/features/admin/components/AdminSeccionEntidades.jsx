// src/components/features/admin/components/AdminSeccionEntidades.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Input, Spinner } from '../../../ui';
import { useAuth } from '../../../../context/AuthContext';
import { useApi } from '../../../../hooks/api/useApi';

/**
 * Componente para mostrar sección de entidades administrativas con paginación y búsqueda
 */
const AdminSeccionEntidades = ({
  titulo,
  tipo,
  items = [],
  onItemClick,
  rutaAgregar,
  loading = false,
  className = ''
}) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const ITEMS_PER_PAGE = 10;

  // Filtrar items por búsqueda
  const itemsFiltrados = items.filter((item) => {
    const texto = (item.nombre || item.titulo || item.nombrePartido || '').toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const totalPaginas = Math.ceil(itemsFiltrados.length / ITEMS_PER_PAGE);
  const itemsPagina = itemsFiltrados.slice(
    (paginaActual - 1) * ITEMS_PER_PAGE,
    paginaActual * ITEMS_PER_PAGE
  );

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  if (loading) {
    return (
      <Card title={titulo} className={className}>
        <Spinner message={`Cargando ${tipo}...`} />
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card title={titulo} className={className}>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No hay {tipo} disponibles
        </p>
      </Card>
    );
  }

  return (
    <Card title={titulo} className={className}>
      {/* Header con búsqueda y agregar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            placeholder={`Buscar ${tipo}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full"
          />
        </div>

        {rutaAgregar && (
          <Button variant="primary">
            ➕ Agregar {tipo}
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {items.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {itemsFiltrados.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Filtrados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {paginaActual}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Página</div>
          </div>
        </div>
      </div>

      {/* Lista de items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {itemsPagina.map((item) => (
          <Card
            key={item._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => onItemClick?.(item._id)}
          >
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {item.nombre || item.titulo || item.nombrePartido || `ID: ${item._id}`}
              </h3>

              <div className="space-y-2 text-sm">
                {/* Mostrar campos específicos según el tipo de entidad */}
                {tipo === 'equipo' && (
                  <>
                    {item.tipo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                        <Badge variant="info">{item.tipo}</Badge>
                      </div>
                    )}
                    {item.esSeleccionNacional && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Seleccion:</span>
                        <Badge variant="success">Nacional</Badge>
                      </div>
                    )}
                    {item.pais && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">País:</span>
                        <span className="font-medium">{item.pais}</span>
                      </div>
                    )}
                  </>
                )}

                {tipo === 'jugador' && (
                  <>
                    {item.fechaNacimiento && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nacimiento:</span>
                        <span className="font-medium">
                          {new Date(item.fechaNacimiento).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {item.genero && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Género:</span>
                        <Badge variant="secondary">{item.genero}</Badge>
                      </div>
                    )}
                    {item.nacionalidad && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nacionalidad:</span>
                        <span className="font-medium">{item.nacionalidad}</span>
                      </div>
                    )}
                  </>
                )}

                {tipo === 'partido' && (
                  <>
                    {item.fecha && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                        <span className="font-medium">
                          {new Date(item.fecha).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {item.estado && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <Badge variant={item.estado === 'finalizado' ? 'success' : item.estado === 'en_curso' ? 'warning' : 'secondary'}>
                          {item.estado}
                        </Badge>
                      </div>
                    )}
                    {item.equipoLocal && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Local:</span>
                        <span className="font-medium">{item.equipoLocal.nombre || item.equipoLocal}</span>
                      </div>
                    )}
                    {item.equipoVisitante && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Visitante:</span>
                        <span className="font-medium">{item.equipoVisitante.nombre || item.equipoVisitante}</span>
                      </div>
                    )}
                  </>
                )}

                {tipo === 'competencia' && (
                  <>
                    {item.tipo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                        <Badge variant="info">{item.tipo}</Badge>
                      </div>
                    )}
                    {item.estado && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <Badge variant={item.estado === 'activa' ? 'success' : 'warning'}>
                          {item.estado}
                        </Badge>
                      </div>
                    )}
                    {item.organizacion && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Organización:</span>
                        <span className="font-medium">{item.organizacion.nombre || item.organizacion}</span>
                      </div>
                    )}
                  </>
                )}

                {tipo === 'organizacion' && (
                  <>
                    {item.descripcion && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Descripción:</span>
                        <span className="font-medium">{item.descripcion.length > 50 ? item.descripcion.substring(0, 50) + '...' : item.descripcion}</span>
                      </div>
                    )}
                    {item.activa !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <Badge variant={item.activa ? 'success' : 'danger'}>
                          {item.activa ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    )}
                    {item.sitioWeb && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Sitio Web:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{item.sitioWeb}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Campos comunes */}
                {item.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Creado:</span>
                    <span className="font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Información adicional si no hay campos específicos */}
                {(!item.tipo && !item.fechaNacimiento && !item.descripcion && !item.fecha && !item.createdAt && tipo !== 'equipo' && tipo !== 'jugador' && tipo !== 'competencia' && tipo !== 'organizacion' && tipo !== 'partido') && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ID:</span>
                    <span className="font-medium font-mono text-xs">{item._id}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            ← Anterior
          </Button>

          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Página {paginaActual} de {totalPaginas}
          </span>

          <Button
            variant="outline"
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AdminSeccionEntidades;
