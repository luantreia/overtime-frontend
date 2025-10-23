import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { renderEstadisticasGenerales } from './EstadisticasGenerales';
import { renderEstadisticasEquipos } from './EstadisticasEquipos';
import { renderEstadisticasJugadores } from './EstadisticasJugadores';

export default function EstadisticasGeneralesPartido({
  partidoId,
  tipoVista = 'directas',
  onRefresh,
  partido,
  onCambiarModoEstadisticas
}) {
  const { token } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    jugadores: [],
    equipos: []
  });
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('general'); // 'general', 'equipos' o 'jugadores'

  // Estados locales para UI inmediata (se sincronizan con props)
  const [modoEstadisticasUI, setModoEstadisticasUI] = useState(partido?.modoEstadisticas || 'automatico');
  const [modoVisualizacionUI, setModoVisualizacionUI] = useState(partido?.modoVisualizacion || 'automatico');

  // Sincronizar estados locales con props cuando cambian
  useEffect(() => {
    const nuevoModo = partido?.modoEstadisticas || 'automatico';
    setModoEstadisticasUI(nuevoModo);
    // Cuando cambia el modo de estadísticas, también sincroniza el modo de visualización
    setModoVisualizacionUI(partido?.modoVisualizacion || nuevoModo);
  }, [partido?.modoEstadisticas, partido?.modoVisualizacion]);

  // Función para determinar qué endpoint usar según el modo de estadísticas
  const getEstadisticasEndpoint = () => {
    if (!modoEstadisticasUI || modoEstadisticasUI === 'automatico') {
      // En modo automático, obtener estadísticas POR SET
      return `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set/resumen-partido/${partidoId}`;
    } else {
      // En modo manual, obtener estadísticas agregadas manuales
      return `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual/resumen-partido/${partidoId}`;
    }
  };

  // Función para cargar estadísticas - exportada para uso externo
  const cargarEstadisticas = useCallback(async () => {
    try {
      console.log(`📊 Cargando estadísticas en modo ${modoEstadisticasUI}:`, {
        modoEstadisticasUI,
        modoVisualizacionUI
      });

      setLoading(true);
      let data = { jugadores: [], equipos: [] }; // Inicializar con valor por defecto
      let endpoint;
      let response;

      if (modoEstadisticasUI === 'automatico') {
        // Cargar estadísticas automáticas POR SET
        endpoint = getEstadisticasEndpoint();
        console.log('🔗 Cargando estadísticas automáticas desde endpoint:', endpoint);

        response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });

        console.log('📡 Respuesta cruda del endpoint automático:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        });

        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('❌ Respuesta no es JSON:', contentType);
          throw new Error(`Respuesta no válida del servidor: ${contentType}`);
        }

        const dataSets = await response.json();

        // Si no hay sets o hay error, retornar datos vacíos
        if (!dataSets.sets || dataSets.sets.length === 0) {
          console.log('⚠️ No hay sets con estadísticas en modo automático');
          data = {
            jugadores: [],
            equipos: []
          };
        } else {
          // Convertir el formato de sets a formato de jugadores para compatibilidad
          const jugadoresFormateados = [];
          dataSets.sets?.forEach(set => {
            set.estadisticas?.forEach(stat => {
              jugadoresFormateados.push({
                _id: `${stat._id}_set_${set.numeroSet}`,
                throws: stat.throws || 0,
                hits: stat.hits || 0,
                outs: stat.outs || 0,
                catches: stat.catches || 0,
                jugadorPartido: stat.jugadorPartido,
                tipoCaptura: 'automatica',
                fuente: `set_${set.numeroSet}`,
                setInfo: {
                  numeroSet: set.numeroSet,
                  estadoSet: set.estadoSet,
                  ganadorSet: set.ganadorSet
                }
              });
            });
          });

          // Calcular estadísticas por equipo agregando las estadísticas de sets
          const equiposMap = {};
          dataSets.sets?.forEach(set => {
            set.estadisticas?.forEach(stat => {
              const equipo = stat.jugadorPartido?.equipo;
              if (equipo) {
                const equipoId = equipo._id || equipo;

                if (!equiposMap[equipoId]) {
                  equiposMap[equipoId] = {
                    _id: equipoId,
                    nombre: equipo.nombre,
                    escudo: equipo.escudo,
                    throws: 0,
                    hits: 0,
                    outs: 0,
                    catches: 0,
                    jugadores: 0
                  };
                }

                equiposMap[equipoId].throws += stat.throws || 0;
                equiposMap[equipoId].hits += stat.hits || 0;
                equiposMap[equipoId].outs += stat.outs || 0;
                equiposMap[equipoId].catches += stat.catches || 0;
                equiposMap[equipoId].jugadores += 1;
              }
            });
          });

          // Calcular efectividad para cada equipo
          Object.values(equiposMap).forEach(equipo => {
            equipo.efectividad = equipo.throws > 0 ? ((equipo.hits / equipo.throws) * 100).toFixed(1) : 0;
          });

          const equiposCalculados = Object.values(equiposMap);

          // Los administradores ven todos los datos disponibles
          // El modoVisualizacionUI solo afecta lo que ven los usuarios comunes
          const jugadoresFiltrados = jugadoresFormateados;

          console.log('📈 Datos de sets procesados:', {
            sets: dataSets.sets?.length || 0,
            estadisticasTotales: jugadoresFormateados.length,
            estadisticasFiltradas: jugadoresFiltrados.length,
            equiposCalculados: equiposCalculados.length,
            equiposData: equiposCalculados.map(e => ({ nombre: e.nombre, throws: e.throws, hits: e.hits }))
          });

          data = {
            jugadores: jugadoresFiltrados,
            equipos: equiposCalculados, // Ahora sí calculamos las estadísticas de equipos
            setsInfo: dataSets.sets || [] // Información adicional de sets
          };
        }
      } else {
        // Cargar estadísticas manuales agregadas
        endpoint = getEstadisticasEndpoint();
        console.log('🔗 Cargando estadísticas manuales desde endpoint:', endpoint);
        response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        console.log('📡 Respuesta del endpoint manual:', response.status, response.statusText);

        // Verificar si la respuesta es JSON
        const contentTypeManual = response.headers.get('content-type');
        if (!contentTypeManual || !contentTypeManual.includes('application/json')) {
          console.error('❌ Respuesta manual no es JSON:', contentTypeManual);
          throw new Error(`Respuesta no válida del servidor: ${contentTypeManual}`);
        }

        const dataManual = await response.json();
        console.log('📊 Datos crudos del endpoint manual:', dataManual);
        console.log('🎯 Estructura de dataManual:', {
          tieneJugadores: !!dataManual.jugadores,
          cantidadJugadores: dataManual.jugadores?.length || 0,
          tieneEquipos: !!dataManual.equipos,
          cantidadEquipos: dataManual.equipos?.length || 0
        });

        // Inspeccionar la estructura de los primeros jugadores
        if (dataManual.jugadores && dataManual.jugadores.length > 0) {
          console.log('🔍 Estructura del primer jugador:', dataManual.jugadores[0]);
          console.log('🔍 Propiedades disponibles:', Object.keys(dataManual.jugadores[0]));
        }

        // Inspeccionar la estructura de equipos
        if (dataManual.equipos && dataManual.equipos.length > 0) {
          console.log('🏆 Estructura del primer equipo:', dataManual.equipos[0]);
          console.log('🏆 Propiedades de equipos:', Object.keys(dataManual.equipos[0]));
        }

        // En modo manual, siempre mostrar las estadísticas de jugadores disponibles
        // El modoVisualizacionUI no afecta la disponibilidad de datos en modo manual
        let jugadoresFiltrados = dataManual.jugadores || [];
        console.log('🎯 Jugadores en modo manual:', jugadoresFiltrados.length, 'modoVisualizacion:', modoVisualizacionUI);
        console.log('🔍 En modo manual, siempre mostramos estadísticas de jugadores disponibles');

        console.log('📊 Datos finales modo manual:', {
          jugadoresOriginales: dataManual.jugadores?.length || 0,
          jugadoresFiltrados: jugadoresFiltrados.length,
          equipos: dataManual.equipos?.length || 0
        });

        data = {
          jugadores: jugadoresFiltrados,
          equipos: dataManual.equipos || [],
          ...(jugadoresFiltrados.length === 0 ? {
            mensaje: 'No hay estadísticas manuales capturadas. Usa la sección "Estadísticas Directas" para ingresar datos.',
            tipo: 'sin-datos-manuales'
          } : {})
        };
      }

      setEstadisticas(data);
      console.log('✅ Estadísticas cargadas exitosamente:', {
        jugadores: data.jugadores?.length || 0,
        equipos: data.equipos?.length || 0
      });

    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      // Asegurar que siempre tengamos un objeto válido
      const errorData = { jugadores: [], equipos: [] };
      setEstadisticas(errorData);
      console.log('⚠️ Estadísticas establecidas con datos de error:', errorData);
    } finally {
      setLoading(false);
    }
  }, [partidoId, token, modoEstadisticasUI, modoVisualizacionUI]);

  const handleCambiarModo = async (nuevoModo) => {
    if (!partido || !onCambiarModoEstadisticas) return;

    const modoAnterior = partido.modoEstadisticas;

    try {
      console.log('🔄 Cambiando modo de estadísticas:', modoAnterior, '→', nuevoModo);
      console.log('📊 Estados actuales antes del cambio:', {
        modoEstadisticasUI,
        modoVisualizacionUI
      });

      // Actualizar estado local inmediatamente para mejor UX
      setModoEstadisticasUI(nuevoModo);
      // Cuando cambias el modo de estadísticas, también cambia el modo de visualización para consistencia
      setModoVisualizacionUI(nuevoModo);

      // Cambiar el modo de estadísticas en el backend
      await onCambiarModoEstadisticas(partido._id, nuevoModo);

      // Intentar actualizar modo de visualización para que coincida (sin bloquear si falla)
      try {
        console.log('🔄 Intentando cambiar modoVisualizacion a:', nuevoModo);
        const response = await fetch(`https://overtime-ddyl.onrender.com/api/partidos/${partido._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ modoVisualizacion: nuevoModo })
        });

        if (response.ok) {
          // Actualizar estado local de visualización también
          setModoVisualizacionUI(nuevoModo);
          console.log('✅ ModoVisualizacion actualizado correctamente a:', nuevoModo);
        } else {
          console.warn('⚠️ No se pudo actualizar modoVisualizacion en backend, pero continuamos');
          // Si no se pudo actualizar en backend, igual actualizamos localmente
          setModoVisualizacionUI(nuevoModo);
        }
      } catch (error) {
        console.warn('⚠️ Error actualizando modoVisualizacion:', error);
      }

      console.log('📊 Estados después del cambio:', {
        modoEstadisticasUI: nuevoModo,
        modoVisualizacionUI: nuevoModo
      });

      // Recargar estadísticas después del cambio
      await cargarEstadisticas();

      console.log('✅ Modo cambiado exitosamente');

    } catch (error) {
      // Revertir cambio local si falló
      setModoEstadisticasUI(modoAnterior);
      console.error('❌ Error cambiando modo de estadísticas:', error);
    }
  };

  const handleCambiarModoVisualizacion = async (nuevoModo) => {
    if (!partido) return;

    const modoAnterior = partido.modoVisualizacion;

    try {
      console.log('🔄 Cambiando modo de visualización:', modoAnterior, '→', nuevoModo);

      // Actualizar estado local inmediatamente
      setModoVisualizacionUI(nuevoModo);

      // Actualizar en el backend
      const response = await fetch(`https://overtime-ddyl.onrender.com/api/partidos/${partido._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ modoVisualizacion: nuevoModo })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar modo de visualización');
      }

      // Recargar estadísticas con el filtro actualizado
      await cargarEstadisticas();

      console.log('✅ Modo de visualización cambiado exitosamente');

    } catch (error) {
      // Revertir cambio local si falló
      setModoVisualizacionUI(modoAnterior);
      console.error('❌ Error cambiando modo de visualización:', error);
    }
  };

  // Efecto para cargar estadísticas inicialmente y cuando cambian los modos
  useEffect(() => {
    if (partidoId && partido) {
      // Cargar estadísticas cuando cambian los modos
      cargarEstadisticas();
    }
  }, [partidoId, modoEstadisticasUI, modoVisualizacionUI, cargarEstadisticas]);

  // Exponer función de refresco si se proporciona callback
  useEffect(() => {
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh(cargarEstadisticas);
    }
  }, [onRefresh, cargarEstadisticas]);

  if (loading) return <div>Cargando estadísticas...</div>;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Estadísticas del Partido</h2>
          <div className="mt-4 space-y-3">
            {/* Información del modo actual */}
            <p className="text-sm text-gray-600">
              Modo Estadísticas: {modoEstadisticasUI} | Modo Visualización: {modoVisualizacionUI}
              {modoEstadisticasUI === 'manual'
                ? '📝 Mostrando estadísticas manuales totales (ingresadas directamente)'
                : '📊 Mostrando estadísticas automáticas por set individual'}
            </p>
          </div>
        </div>

        {/* Selectores de vista (derecha) */}
        <div className="flex flex-col gap-2 ml-4">
          {/* Selector de Modo de Estadísticas (centro) */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Modo de captura:</span>
            <select
              value={modoEstadisticasUI}
              onChange={(e) => handleCambiarModo(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="automatico">📊 Automático (por set)</option>
              <option value="manual">✏️ Manual (totales)</option>
            </select>
          </div>

          {/* Botones de vista de estadísticas */}
          <div className="flex space-x-2">
            <button
              onClick={() => setVista('general')}
              className={`px-4 py-2 rounded-md ${
                vista === 'general'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setVista('equipos')}
              className={`px-4 py-2 rounded-md ${
                vista === 'equipos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Equipos
            </button>
            <button
              onClick={() => setVista('jugadores')}
              className={`px-4 py-2 rounded-md ${
                vista === 'jugadores'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Jugadores
            </button>
          </div>
        </div>
      </div>

      {vista === 'general'
        ? renderEstadisticasGenerales(estadisticas, partido, modoEstadisticasUI, modoVisualizacionUI)
        : vista === 'equipos'
          ? renderEstadisticasEquipos(estadisticas, partido)
          : (() => {
              console.log('🏃‍♂️ Renderizando vista de jugadores:', {
                vista,
                jugadoresCount: estadisticas.jugadores?.length || 0,
                modoEstadisticasUI,
                modoVisualizacionUI
              });
              return renderEstadisticasJugadores(estadisticas, partido);
            })()
      }
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`p-3 rounded-lg ${color}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}