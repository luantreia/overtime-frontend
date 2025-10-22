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
  const [serviciosCargados, setServiciosCargados] = useState(false);

  useEffect(() => {
    import('../../services/jugadorPartidoService').then(module => {
      setServicios({
        obtenerJugadoresPartido: module.obtenerJugadoresPartido,
        agregarJugadorPartido: module.agregarJugadorPartido
      });
      setServiciosCargados(true);
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
      await actualizarSetSeleccionado(setData || {});
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

  // Helpers clave actuales
  const setKey = `${numeroSetSeleccionado || ''}`;

  // Asignar jugador a un índice del equipo en el set seleccionado
  const asignarJugador = useCallback(async (index, jugadorId, equipoId) => {
    if (!numeroSetSeleccionado) return;
    try {
      // Asegurar jugadorPartido
      let jugadorPartidoId = null;
      if (serviciosCargados && servicios?.obtenerJugadoresPartido) {
        const existentes = await servicios.obtenerJugadoresPartido(partidoId, token);
        const match = existentes.find(jp => (jp.jugador?._id || jp.jugador) === jugadorId && (jp.equipo?._id || jp.equipo) === equipoId);
        if (match) {
          jugadorPartidoId = match._id;
        } else if (servicios?.agregarJugadorPartido) {
          const creado = await servicios.agregarJugadorPartido({ partido: partidoId, jugador: jugadorId, equipo: equipoId }, token);
          jugadorPartidoId = creado?._id || null;
        }
      }

      setJugadoresPorSet(prev => {
        const actual = { ...(prev[setKey] || {}) };
        const listaEquipo = Array.isArray(actual[equipoId]) ? [...actual[equipoId]] : [];
        listaEquipo[index] = {
          jugadorId,
          jugadorPartidoId,
          estadisticas: listaEquipo[index]?.estadisticas || { throws: 0, hits: 0, outs: 0, catches: 0 }
        };
        return { ...prev, [setKey]: { ...actual, [equipoId]: listaEquipo } };
      });
    } catch (e) {
      console.error('Error asignando jugador:', e);
    }
  }, [numeroSetSeleccionado, servicios, serviciosCargados, partidoId, token, setKey]);

  // Cambiar estadística puntual
  const cambiarEstadistica = useCallback((equipoId, index, campo, delta) => {
    if (!numeroSetSeleccionado) return;
    setJugadoresPorSet(prev => {
      const actual = { ...(prev[setKey] || {}) };
      const listaEquipo = Array.isArray(actual[equipoId]) ? [...actual[equipoId]] : [];
      const item = { ...(listaEquipo[index] || { jugadorId: null, jugadorPartidoId: null, estadisticas: {} }) };
      const prevVal = Number(item.estadisticas?.[campo] || 0);
      const nextVal = Math.max(0, prevVal + Number(delta || 0));
      item.estadisticas = { throws: 0, hits: 0, outs: 0, catches: 0, ...item.estadisticas, [campo]: nextVal };
      listaEquipo[index] = item;
      return { ...prev, [setKey]: { ...actual, [equipoId]: listaEquipo } };
    });
  }, [numeroSetSeleccionado, setKey]);

  // Copiar SOLO jugadores del set anterior al actual (estadísticas en 0)
  const copiarJugadoresDeSetAnterior = useCallback(() => {
    if (!numeroSetSeleccionado) return;
    const actualNum = parseInt(numeroSetSeleccionado, 10);
    const previoNum = actualNum - 1;
    if (!previoNum || previoNum < 1) return;
    const prevKey = `${previoNum}`;
    setJugadoresPorSet(prev => {
      const origen = prev[prevKey];
      if (!origen) return prev;
      const destino = {};
      for (const [equipoId, lista] of Object.entries(origen)) {
        destino[equipoId] = (lista || []).map(item => ({
          jugadorId: item.jugadorId || null,
          jugadorPartidoId: item.jugadorPartidoId || null,
          estadisticas: { throws: 0, hits: 0, outs: 0, catches: 0 }
        }));
      }
      return { ...prev, [setKey]: destino };
    });
  }, [numeroSetSeleccionado, setKey]);

  // Guardar wrapper que toma el estado actual del set seleccionado
  const guardar = useCallback(async () => {
    if (!numeroSetSeleccionado || !estadisticasSet?._id) return false;
    const est = jugadoresPorSet[setKey] || {};
    return await guardarEstadisticasSet(est, {});
  }, [numeroSetSeleccionado, estadisticasSet, jugadoresPorSet, setKey, guardarEstadisticasSet]);

  // Confirmación de recalculo (stubs básicos para integrarse con UI actual)
  const confirmarRecalculo = useCallback(() => {
    setMostrarConfirmacionManual(false);
    setSetDataPendiente(null);
  }, []);

  const cancelarRecalculo = useCallback(() => {
    setMostrarConfirmacionManual(false);
    setSetDataPendiente(null);
  }, []);

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
    setDataPendiente,
    guardar,
    asignarJugador,
    cambiarEstadistica,
    copiarJugadoresDeSetAnterior,
    confirmarRecalculo,
    cancelarRecalculo,
    serviciosCargados
  };
}
