import React, { useState, useEffect } from 'react';

export function SeccionEstadisticasDirectas({
  partido,
  partidoId,
  token,
  onRefresh,
  setModalEstadisticasGeneralesAbierto
}) {
  const [estadisticasAutomaticas, setEstadisticasAutomaticas] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Cargar estadísticas automáticas agregadas para usar como valores por defecto
  useEffect(() => {
    const cargarEstadisticasAutomaticas = async () => {
      try {
        setCargando(true);
        console.log('🔍 Buscando estadísticas automáticas para partido:', partidoId);

        // Intentar cargar estadísticas automáticas agregadas primero
        const responseAgregadas = await fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/resumen-partido/${partidoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (responseAgregadas.ok) {
          const dataAgregadas = await responseAgregadas.json();
          console.log('📊 Estadísticas automáticas agregadas encontradas:', dataAgregadas.jugadores?.length || 0);
          setEstadisticasAutomaticas(dataAgregadas.jugadores || []);
        } else {
          console.log('⚠️ No hay estadísticas agregadas, buscando individuales...');

          // Si no hay agregadas, intentar cargar individuales
          const responseIndividuales = await fetch(
            `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido?partido=${partidoId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (responseIndividuales.ok) {
            const dataIndividuales = await responseIndividuales.json();
            console.log('📊 Estadísticas automáticas individuales encontradas:', dataIndividuales.length);

            if (dataIndividuales.length === 0) {
              console.log('⚠️ No hay estadísticas individuales, intentando crearlas desde sets...');

              // Si no hay estadísticas individuales, intentar crearlas desde las estadísticas por set
              await crearEstadisticasDesdeSets();
            } else {
              setEstadisticasAutomaticas(dataIndividuales);
            }
          } else {
            console.log('⚠️ No se encontraron estadísticas, intentando crearlas desde sets...');
            await crearEstadisticasDesdeSets();
          }
        }
      } catch (error) {
        console.error('Error cargando estadísticas automáticas:', error);
        setEstadisticasAutomaticas([]);
      } finally {
        setCargando(false);
      }
    };

    const crearEstadisticasDesdeSets = async () => {
      try {
        console.log('🔧 Intentando crear estadísticas desde datos de sets...');

        // Buscar estadísticas por set para este partido
        const responseSets = await fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set?partido=${partidoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (responseSets.ok) {
          const dataSets = await responseSets.json();
          console.log('📈 Estadísticas por set encontradas:', dataSets.length);

          if (dataSets.length > 0) {
            // Agrupar por jugador y crear estadísticas agregadas
            const statsPorJugador = {};

            dataSets.forEach(stat => {
              const jugadorId = stat.jugadorPartido._id || stat.jugadorPartido;
              if (!statsPorJugador[jugadorId]) {
                statsPorJugador[jugadorId] = {
                  _id: stat._id,
                  jugadorPartido: stat.jugadorPartido,
                  throws: 0,
                  hits: 0,
                  outs: 0,
                  catches: 0,
                  tipoCaptura: 'automatico'
                };
              }

              statsPorJugador[jugadorId].throws += stat.throws || 0;
              statsPorJugador[jugadorId].hits += stat.hits || 0;
              statsPorJugador[jugadorId].outs += stat.outs || 0;
              statsPorJugador[jugadorId].catches += stat.catches || 0;
            });

            const estadisticasAgregadas = Object.values(statsPorJugador);
            console.log('✅ Estadísticas agregadas creadas desde sets:', estadisticasAgregadas.length);
            setEstadisticasAutomaticas(estadisticasAgregadas);
          } else {
            console.log('⚠️ No hay estadísticas por set para este partido');
            setEstadisticasAutomaticas([]);
          }
        } else {
          console.log('⚠️ Error consultando estadísticas por set');
          setEstadisticasAutomaticas([]);
        }
      } catch (error) {
        console.error('Error creando estadísticas desde sets:', error);
        setEstadisticasAutomaticas([]);
      }
    };

    if (partidoId && token) {
      cargarEstadisticasAutomaticas();
    }
  }, [partidoId, token]);

  const handleAbrirModal = () => {
    // Pasar las estadísticas automáticas como datos iniciales
    setModalEstadisticasGeneralesAbierto({
      datosIniciales: estadisticasAutomaticas,
      hayDatosAutomaticos: estadisticasAutomaticas.length > 0
    });
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-green-800">⚡ Estadísticas Directas</h4>
          <p className="text-sm text-green-700">Captura estadísticas directamente para todo el partido sin sets individuales</p>
          {estadisticasAutomaticas.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              💡 Se autocompletarán con {estadisticasAutomaticas.length} estadísticas automáticas disponibles
            </p>
          )}
          {estadisticasAutomaticas.length === 0 && !cargando && (
            <p className="text-xs text-orange-600 mt-1">
              🔍 Si hay estadísticas por set guardadas, se cargarán automáticamente
            </p>
          )}
        </div>
        <button
          onClick={handleAbrirModal}
          disabled={cargando}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {cargando ? 'Cargando...' : 'Capturar Estadísticas Generales'}
        </button>
      </div>

      <div className="text-center py-8">
        <div className="text-green-600 mb-2">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-green-700 text-sm">
          {estadisticasAutomaticas.length > 0
            ? `Haz clic para capturar datos. Se autocompletarán ${estadisticasAutomaticas.length} estadísticas existentes.`
            : 'Haz clic para capturar estadísticas. Si hay datos por set guardados, se cargarán automáticamente.'
          }
        </p>
      </div>
    </div>
  );
}
