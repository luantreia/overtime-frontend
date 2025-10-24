// src/components/features/admin/components/AdminStats.jsx
import React from 'react';
import { Card, Badge } from '../../../ui';
import { formatNumber } from '../../../../utils';

/**
 * Componente AdminStats para mostrar estadísticas generales de administración
 */
const AdminStats = ({
  stats = {},
  equipos = [],
  jugadores = [],
  partidos = [],
  competencias = [],
  organizaciones = [],
  title = 'Estadísticas del Sistema',
  className = ''
}) => {
  // Calcular estadísticas reales de los datos disponibles
  const statsCalculadas = {
    totalEquipos: equipos.length,
    equiposActivos: equipos.filter(e => e.activo !== false).length,
    totalJugadores: jugadores.length,
    jugadoresActivos: jugadores.filter(j => j.activo !== false).length,
    totalPartidos: partidos.length,
    partidosFinalizados: partidos.filter(p => p.estado === 'finalizado').length,
    totalCompetencias: competencias.length,
    competenciasActivas: competencias.filter(c => c.estado === 'activa').length,
    totalOrganizaciones: organizaciones.length,
    organizacionesActivas: organizaciones.filter(o => o.activa !== false).length,
    usuariosRegistrados: stats.usuariosRegistrados || 0,
    usuariosActivos: stats.usuariosActivos || 0
  };

  const {
    totalEquipos,
    equiposActivos,
    totalJugadores,
    jugadoresActivos,
    totalPartidos,
    partidosFinalizados,
    totalCompetencias,
    competenciasActivas,
    totalOrganizaciones,
    organizacionesActivas,
    usuariosRegistrados,
    usuariosActivos
  } = statsCalculadas;

  const statCards = [
    {
      title: 'Equipos',
      total: totalEquipos,
      active: equiposActivos,
      variant: 'blue',
      icon: '🛡️'
    },
    {
      title: 'Jugadores',
      total: totalJugadores,
      active: jugadoresActivos,
      variant: 'green',
      icon: '👟'
    },
    {
      title: 'Partidos',
      total: totalPartidos,
      active: partidosFinalizados,
      variant: 'purple',
      icon: '🏟️'
    },
    {
      title: 'Competencias',
      total: totalCompetencias,
      active: competenciasActivas,
      variant: 'orange',
      icon: '🏅'
    },
    {
      title: 'Organizaciones',
      total: totalOrganizaciones,
      active: organizacionesActivas,
      variant: 'red',
      icon: '🏢'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <Card title={title}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatNumber(stat.total)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {stat.title} Totales
              </div>
              <Badge variant="success" size="sm">
                {formatNumber(stat.active)} activos
              </Badge>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Usuarios registrados:</span>
              <p className="text-gray-600 dark:text-gray-400">{formatNumber(usuariosRegistrados)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Usuarios activos:</span>
              <p className="text-gray-600 dark:text-gray-400">{formatNumber(usuariosActivos)}</p>
            </div>
          </div>
        </div>

        {/* Métricas calculadas */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Métricas del Sistema
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                {totalPartidos > 0 ? ((partidosFinalizados / totalPartidos) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-blue-600 dark:text-blue-400">Partidos Completados</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                {totalJugadores > 0 ? ((jugadoresActivos / totalJugadores) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-green-600 dark:text-green-400">Jugadores Activos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                {totalCompetencias > 0 ? ((competenciasActivas / totalCompetencias) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-purple-600 dark:text-purple-400">Competencias Activas</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-lg font-semibold text-red-700 dark:text-red-300">
                {totalOrganizaciones > 0 ? ((organizacionesActivas / totalOrganizaciones) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-red-600 dark:text-red-400">Organizaciones Activas</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminStats;
