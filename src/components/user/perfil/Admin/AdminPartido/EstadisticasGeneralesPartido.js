import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
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
  const [debugData, setDebugData] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Estados locales para UI inmediata (se sincronizan con props)
  const [modoEstadisticasUI, setModoEstadisticasUI] = useState(partido?.modoEstadisticas || 'automatico');
  const [modoVisualizacionUI, setModoVisualizacionUI] = useState(partido?.modoVisualizacion || 'automatico');

  // Sincronizar estados locales con props cuando cambian
  useEffect(() => {
    setModoEstadisticasUI(partido?.modoEstadisticas || 'automatico');
  }, [partido?.modoEstadisticas]);

  useEffect(() => {
    setModoVisualizacionUI(partido?.modoVisualizacion || 'automatico');
  }, [partido?.modoVisualizacion]);

  // Función para determinar qué endpoint usar según el modo de estadísticas
  const getEstadisticasEndpoint = () => {
    if (!modoEstadisticasUI || modoEstadisticasUI === 'automatico') {
      return 'https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido';
    } else {
      return 'https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual';
    }
  };

  // Función para cargar estadísticas - exportada para uso externo
  const cargarEstadisticas = useCallback(async () => {
    try {
      console.log('📊 Cargando estadísticas con modos:', {
        modoEstadisticasUI,
        modoVisualizacionUI,
        tipoVista
      });

      setLoading(true);
      let data;

      if (tipoVista === 'directas') {
        // Cargar estadísticas directas (EstadisticasJugadorPartido o Manual según modo)
        const endpoint = getEstadisticasEndpoint();
        console.log('🔗 Usando endpoint:', endpoint);

        const [jugadoresResponse, equiposResponse] = await Promise.all([
          fetch(
            `${endpoint}?partido=${partidoId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `https://overtime-ddyl.onrender.com/api/estadisticas/equipo-partido?partido=${partidoId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);

        const estadisticasDirectas = await jugadoresResponse.json();
        const estadisticasEquipos = await equiposResponse.json();

        console.log('📈 Datos obtenidos:', {
          jugadores: estadisticasDirectas.length,
          equipos: estadisticasEquipos.length
        });

        // Formatear estadísticas de jugadores (ya no necesitamos filtrar por tipoCaptura)
        const jugadoresFormateados = estadisticasDirectas.map(stat => ({
          _id: stat._id,
          throws: stat.throws || 0,
          hits: stat.hits || 0,
          outs: stat.outs || 0,
          catches: stat.catches || 0,
          jugadorPartido: stat.jugadorPartido,
          // Para compatibilidad, agregamos tipoCaptura basado en el modelo usado
          tipoCaptura: endpoint.includes('manual') ? 'manual' : 'automatica',
          fuente: stat.fuente || 'sistema'
        }));

        // Aplicar filtro de visualización SOLO si estamos en modo de estadísticas que requiere filtrado
        let jugadoresFiltrados = jugadoresFormateados;
        if (modoEstadisticasUI === 'automatico' && modoVisualizacionUI === 'manual') {
          // Si estamos en automático pero queremos ver manual, no hay datos
          jugadoresFiltrados = [];
          console.log('🔍 Filtro aplicado: automático → manual = sin datos');
        } else if (modoEstadisticasUI === 'manual' && modoVisualizacionUI === 'automatico') {
          // Si estamos en manual pero queremos ver automático, no hay datos
          jugadoresFiltrados = [];
          console.log('🔍 Filtro aplicado: manual → automático = sin datos');
        } else {
          console.log('🔍 Filtro aplicado: modos compatibles, mostrando todos los datos');
        }
        // Si coinciden los modos, mostramos todos los datos disponibles

        console.log('📊 Datos finales:', {
          jugadoresOriginales: jugadoresFormateados.length,
          jugadoresFiltrados: jugadoresFiltrados.length,
          equipos: estadisticasEquipos.length
        });

        // Usar estadísticas de equipos reales de la base de datos
        const equiposFormateados = estadisticasEquipos.map(equipo => ({
          _id: equipo.equipo._id,
          nombre: equipo.equipo.nombre,
          escudo: equipo.equipo.escudo,
          throws: equipo.throws || 0,
          hits: equipo.hits || 0,
          outs: equipo.outs || 0,
          catches: equipo.catches || 0,
          efectividad: equipo.throws > 0 ? ((equipo.hits / equipo.throws) * 100).toFixed(1) : 0,
          jugadores: equipo.jugadores || 0
        }));

        data = {
          jugadores: jugadoresFiltrados,
          equipos: equiposFormateados
        };
      } else {
        // Cargar estadísticas agregadas (desde sets)
        const response = await fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/resumen-partido/${partidoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = await response.json();
      }

      setEstadisticas(data);
      console.log('✅ Estadísticas cargadas exitosamente:', {
        jugadores: data.jugadores?.length || 0,
        equipos: data.equipos?.length || 0
      });
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      setEstadisticas({ jugadores: [], equipos: [] });
    } finally {
      setLoading(false);
    }
  }, [partidoId, token, tipoVista, modoEstadisticasUI, modoVisualizacionUI]);

  // Función para cargar estadísticas mixtas (ambas fuentes)
  const cargarEstadisticasMixtas = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar ambas fuentes simultáneamente
      const [automaticasResponse, manualesResponse, equiposResponse] = await Promise.all([
        fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido?partido=${partidoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual?partido=${partidoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/equipo-partido?partido=${partidoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      const estadisticasAutomaticas = await automaticasResponse.json();
      const estadisticasManuales = await manualesResponse.json();
      const estadisticasEquipos = await equiposResponse.json();

      // Combinar ambas fuentes de estadísticas
      const estadisticasCombinadas = [
        ...estadisticasAutomaticas.map(stat => ({
          ...stat,
          tipoCaptura: 'automatica',
          fuente: stat.fuente || 'calculo-automatico-sets'
        })),
        ...estadisticasManuales.map(stat => ({
          ...stat,
          tipoCaptura: 'manual',
          fuente: stat.fuente || 'ingreso-manual'
        }))
      ];

      // Usar estadísticas de equipos
      const equiposFormateados = estadisticasEquipos.map(equipo => ({
        _id: equipo.equipo._id,
        nombre: equipo.equipo.nombre,
        escudo: equipo.equipo.escudo,
        throws: equipo.throws || 0,
        hits: equipo.hits || 0,
        outs: equipo.outs || 0,
        catches: equipo.catches || 0,
        efectividad: equipo.throws > 0 ? ((equipo.hits / equipo.throws) * 100).toFixed(1) : 0,
        jugadores: equipo.jugadores || 0
      }));

      setEstadisticas({
        jugadores: estadisticasCombinadas,
        equipos: equiposFormateados
      });

    } catch (error) {
      console.error('Error cargando estadísticas mixtas:', error);
      setEstadisticas({ jugadores: [], equipos: [] });
    } finally {
      setLoading(false);
    }
  }, [partidoId, token]);

  const cargarDebugData = async () => {
    try {
      const response = await fetch(
        `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/debug?partido=${partidoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setDebugData(data);
      setShowDebug(true);
    } catch (error) {
      console.error('Error cargando debug data:', error);
    }
  };

  // Función para filtrar estadísticas según modo de visualización (ya no se usa, el filtrado se hace en cargarEstadisticas)
  const filtrarEstadisticasPorModo = (estadisticasRaw) => {
    // Este método ya no se usa, el filtrado se hace directamente en cargarEstadisticas
    return estadisticasRaw;
  };

  const handleCambiarModo = async (nuevoModo) => {
    if (!partido || !onCambiarModoEstadisticas) return;

    const modoAnterior = partido.modoEstadisticas;

    try {
      console.log('🔄 Cambiando modo de estadísticas:', modoAnterior, '→', nuevoModo);

      // Actualizar estado local inmediatamente para mejor UX
      setModoEstadisticasUI(nuevoModo);

      // Cambiar el modo de estadísticas en el backend
      await onCambiarModoEstadisticas(partido._id, nuevoModo);

      // Intentar actualizar modo de visualización para que coincida (sin bloquear si falla)
      try {
        await fetch(`https://overtime-ddyl.onrender.com/api/partidos/${partido._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ modoVisualizacion: nuevoModo })
        });
        // Actualizar estado local de visualización también
        setModoVisualizacionUI(nuevoModo);
      } catch (error) {
        console.warn('No se pudo sincronizar modoVisualizacion, pero modoEstadisticas se cambió correctamente');
      }

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
            {/* Selector de Modo de Visualización (arriba) */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Mostrar al público:</span>
              <select
                value={modoVisualizacionUI}
                onChange={(e) => handleCambiarModoVisualizacion(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="automatico">📊 Estadísticas Automáticas (calculadas)</option>
                <option value="manual">✏️ Estadísticas Manuales (ingresadas)</option>
              </select>
            </div>

            {/* Información del modo actual */}
            <p className="text-sm text-gray-600 mt-1">
              {modoEstadisticasUI === 'manual'
                ? '📝 Mostrando estadísticas manuales (ingresadas directamente)'
                : '📊 Mostrando estadísticas automáticas (calculadas de sets)'}
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
              <option value="automatico">📊 Automático</option>
              <option value="manual">✏️ Manual</option>
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
            <button
              onClick={cargarDebugData}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              🔧 Debug
            </button>
          </div>
        </div>
      </div>

      {showDebug && debugData ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-red-800">🔧 Debug Data</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Cerrar
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-red-700">📊 Estadísticas por Set:</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugData.estadisticasJugadorSet, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-red-700">👤 Estadísticas por Jugador (Partido):</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugData.estadisticasJugadorPartido, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-red-700">🏟️ Estadísticas por Equipo:</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugData.estadisticasEquipoPartido, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-red-700">👥 Jugadores del Partido:</h4>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugData.jugadorPartido, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : vista === 'general'
        ? renderEstadisticasGenerales(estadisticas, partido)
        : vista === 'equipos'
          ? renderEstadisticasEquipos(estadisticas, partido)
          : renderEstadisticasJugadores(estadisticas, partido)}
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