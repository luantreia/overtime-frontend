// src/components/features/estadisticas/components/GraficoEstadisticasCard.jsx
import React, { useState } from 'react';
import { Card, Badge, Button } from '../../../ui';

/**
 * Componente para mostrar gráficos de estadísticas con opciones de visualización
 */
const GraficoEstadisticasCard = ({
  datos,
  tipo = 'barras',
  title = 'Gráfico de Estadísticas',
  className = ''
}) => {
  const [vistaSeleccionada, setVistaSeleccionada] = useState('tabla');

  if (!datos || datos.length === 0) {
    return (
      <Card title={title} className={className}>
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No hay datos para mostrar
        </p>
      </Card>
    );
  }

  return (
    <Card title={title} className={className}>
      {/* Controles de vista */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={vistaSeleccionada === 'tabla' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVistaSeleccionada('tabla')}
          >
            📊 Tabla
          </Button>
          <Button
            variant={vistaSeleccionada === 'grafico' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVistaSeleccionada('grafico')}
          >
            📈 Gráfico
          </Button>
        </div>

        <Badge variant="secondary">
          {datos.length} registros
        </Badge>
      </div>

      {/* Contenido según vista seleccionada */}
      {vistaSeleccionada === 'tabla' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Jugador</th>
                <th className="px-4 py-3 text-center">Lanzamientos</th>
                <th className="px-4 py-3 text-center">Hits</th>
                <th className="px-4 py-3 text-center">Outs</th>
                <th className="px-4 py-3 text-center">Catches</th>
                <th className="px-4 py-3 text-center">Efectividad</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((jugador, index) => {
                const efectividad = jugador.throws > 0 ? (jugador.hits / jugador.throws) * 100 : 0;

                return (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {jugador.nombre || 'Jugador'}
                    </td>
                    <td className="px-4 py-3 text-center">{jugador.throws || 0}</td>
                    <td className="px-4 py-3 text-center text-green-600 dark:text-green-400">
                      {jugador.hits || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600 dark:text-red-400">
                      {jugador.outs || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400">
                      {jugador.catches || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={efectividad >= 70 ? 'success' : efectividad >= 50 ? 'warning' : 'danger'}
                        size="xs"
                      >
                        {efectividad.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Gráfico de barras simple con CSS */}
          <div className="space-y-3">
            {datos.slice(0, 10).map((jugador, index) => {
              const efectividad = jugador.throws > 0 ? (jugador.hits / jugador.throws) * 100 : 0;
              const maxThrows = Math.max(...datos.map(j => j.throws || 0));

              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {jugador.nombre || 'Jugador'}
                    </span>
                    <Badge variant="outline" size="xs">
                      {efectividad.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(jugador.throws / maxThrows) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Hits: {jugador.hits || 0}</span>
                    <span>Outs: {jugador.outs || 0}</span>
                    <span>Catches: {jugador.catches || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {datos.length > 10 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Mostrando primeros 10 jugadores. Total: {datos.length}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default GraficoEstadisticasCard;
