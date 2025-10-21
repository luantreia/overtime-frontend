import { useState, useEffect, useCallback } from 'react';

export function useEstadisticasSet({
  partidoId,
  numeroSetSeleccionado,
  estadisticasSet,
  setsLocales,
  token,
  actualizarSetSeleccionado,
  refrescarPartidoSeleccionado
}) {
  // Importar servicios dinámicamente
  const [servicios, setServicios] = useState(null);

  useEffect(() => {
    import('../../services/jugadorPartidoService').then(module => {
      setServicios({
        obtenerJugadoresPartido: module.obtenerJugadoresPartido,
        agregarJugadorPartido: module.agregarJugadorPartido
      });
    });
  }, []);

  const [jugadoresPorSet, setJugadoresPorSet] = useState({});
  const [estadisticasIniciales, setEstadisticasIniciales] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Estado para modal de confirmación de estadísticas manuales
  const [mostrarConfirmacionManual, setMostrarConfirmacionManual] = useState(false);
  const [estadisticasManualesDetectadas, setEstadisticasManualesDetectadas] = useState([]);
  const [setDataPendiente, setSetDataPendiente] = useState(null);

  // Funciones principales del hook (simplificadas para el movimiento)
  const cargarEstadisticasSet = useCallback(async () => {
    if (!numeroSetSeleccionado || !estadisticasSet?._id) return;

    try {
      const response = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set?set=${estadisticasSet._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) return;

      const estadisticasExistentes = await response.json();
      if (estadisticasExistentes.length === 0) return;

      // Reconstruir estado básico
      const setKey = `${numeroSetSeleccionado}`;
      const nuevoEstado = {};

      for (const stat of estadisticasExistentes) {
        const equipoId = stat.equipo._id || stat.equipo;
        if (!nuevoEstado[equipoId]) {
          nuevoEstado[equipoId] = [];
        }

        nuevoEstado[equipoId].push({
          jugadorId: stat.jugador._id || stat.jugador,
          jugadorPartidoId: stat.jugadorPartido._id || stat.jugadorPartido,
          estadisticas: {
            throws: stat.throws || 0,
            hits: stat.hits || 0,
            outs: stat.outs || 0,
            catches: stat.catches || 0
          }
        });
      }

      setJugadoresPorSet(prev => ({
        ...prev,
        [setKey]: nuevoEstado
      }));

    } catch (error) {
      console.error('Error cargando estadísticas del set:', error);
    }
  }, [numeroSetSeleccionado, estadisticasSet, token]);

  // Función para guardar estadísticas
  const guardarEstadisticasSet = useCallback(async (estadisticas, setData) => {
    setGuardando(true);
    try {
      const promises = [];

      for (const [equipoId, jugadores] of Object.entries(estadisticas)) {
        for (const jugador of jugadores) {
          const data = {
            set: estadisticasSet._id,
            jugadorPartido: jugador.jugadorPartidoId,
            jugador: jugador.jugadorId,
            equipo: equipoId,
            throws: jugador.estadisticas.throws || 0,
            hits: jugador.estadisticas.hits || 0,
            outs: jugador.estadisticas.outs || 0,
            catches: jugador.estadisticas.catches || 0
          };

          promises.push(
            fetch('https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(data)
            })
          );
        }
      }

      await Promise.all(promises);
      await actualizarSetSeleccionado(estadisticasSet.numeroSet, setData);
      await refrescarPartidoSeleccionado();

      console.log('✅ Estadísticas del set guardadas correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error guardando estadísticas del set:', error);
      return false;
    } finally {
      setGuardando(false);
    }
  }, [estadisticasSet, token, actualizarSetSeleccionado, refrescarPartidoSeleccionado]);

  // Efectos
  useEffect(() => {
    if (numeroSetSeleccionado && estadisticasSet?._id) {
      cargarEstadisticasSet();
    }
  }, [numeroSetSeleccionado, estadisticasSet, cargarEstadisticasSet]);

  return {
    jugadoresPorSet,
    estadisticasIniciales,
    guardando,
    mostrarConfirmacionManual,
    estadisticasManualesDetectadas,
    setMostrarConfirmacionManual,
    setEstadisticasManualesDetectadas,
    setSetDataPendiente,
    guardarEstadisticasSet,
    cargarEstadisticasSet
  };
}
