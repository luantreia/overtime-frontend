import { useState, useEffect } from 'react';
import { agregarJugadorPartido } from '../../services/jugadorPartidoService';
import { notifications } from '../../utils/notifications';

/**
 * Hook personalizado para manejar la lógica de estadísticas del modal
 */
export const useEstadisticasModal = (partidoId, token) => {
  // Estados principales
  const [jugadores, setJugadores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados de selecciones
  const [seleccionesLocal, setSeleccionesLocal] = useState(Array(10).fill(''));
  const [seleccionesVisitante, setSeleccionesVisitante] = useState(Array(10).fill(''));

  // Estados de UI
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [tipoAutocompletado, setTipoAutocompletado] = useState(null); // 'automatico', 'manual-previo', null

  // Estados de asignación de jugadores
  const [jugadoresSeleccionadosLocal, setJugadoresSeleccionadosLocal] = useState(new Set());
  const [jugadoresSeleccionadosVisitante, setJugadoresSeleccionadosVisitante] = useState(new Set());
  const [asignandoJugadores, setAsignandoJugadores] = useState(false);

  // Función principal para cargar datos
  const cargarJugadoresYEstadisticas = async (partido, datosIniciales = [], hayDatosAutomaticos = false) => {
    try {
      const responseJugadores = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-partido?partido=${partidoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!responseJugadores.ok) {
        throw new Error('Error al cargar jugadores');
      }

      const jugadoresData = await responseJugadores.json();
      setJugadores(jugadoresData);

      if (jugadoresData.length === 0) {
        setMostrarAsignacion(true);
        return;
      }

      // Primero verificar si hay datos manuales previos para autocompletar
      const responseEstadisticasManuales = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual?partido=${partidoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let hayDatosManualesPrevios = false;
      if (responseEstadisticasManuales.ok) {
        const estadisticasManualesData = await responseEstadisticasManuales.json();
        console.log('📊 Datos manuales previos encontrados:', estadisticasManualesData.length);

        // Filtrar solo estadísticas que corresponden a jugadores actualmente asignados
        const estadisticasManualesFiltradas = estadisticasManualesData.filter(stat => {
          const jugadorPartidoId = stat.jugadorPartido._id;
          return jugadoresData.some(j => j._id === jugadorPartidoId);
        });

        console.log('📊 Datos manuales válidos (jugadores asignados):', estadisticasManualesFiltradas.length);

        if (estadisticasManualesFiltradas.length > 0) {
          hayDatosManualesPrevios = true;

          // Autocompletar con datos manuales previos
          const estadisticasMap = {};
          estadisticasManualesFiltradas.forEach(stat => {
            estadisticasMap[stat.jugadorPartido._id] = {
              ...stat,
              fuente: 'autocompletado-manual-previo'
            };
          });
          setEstadisticas(estadisticasMap);

          // Pre-seleccionar posiciones basadas en datos manuales
          const nuevasSeleccionesLocal = Array(10).fill('');
          const nuevasSeleccionesVisitante = Array(10).fill('');

          preSeleccionarPosiciones(estadisticasManualesFiltradas, partido, nuevasSeleccionesLocal, nuevasSeleccionesVisitante);

          setSeleccionesLocal(nuevasSeleccionesLocal);
          setSeleccionesVisitante(nuevasSeleccionesVisitante);
          setTipoAutocompletado('manual-previo');
        }
      }

      // Si no hay datos manuales previos, intentar con datos automáticos
      if (!hayDatosManualesPrevios && hayDatosAutomaticos && datosIniciales.length > 0) {
        // Autocompletar con datos automáticos (sets calculados)
        const estadisticasMap = {};
        datosIniciales.forEach(stat => {
          estadisticasMap[stat.jugadorPartido._id] = {
            ...stat,
            _id: undefined,
            fuente: 'autocompletado-automatico'
          };
        });
        setEstadisticas(estadisticasMap);

        const nuevasSeleccionesLocal = Array(10).fill('');
        const nuevasSeleccionesVisitante = Array(10).fill('');

        preSeleccionarPosiciones(datosIniciales, partido, nuevasSeleccionesLocal, nuevasSeleccionesVisitante);

        setSeleccionesLocal(nuevasSeleccionesLocal);
        setSeleccionesVisitante(nuevasSeleccionesVisitante);
        setTipoAutocompletado('automatico');
      } else {
        // No hay datos para autocompletar
        console.log('ℹ️ No hay datos para autocompletar (ni manuales ni automáticos)');
        setTipoAutocompletado(null);
      }

      setMostrarAsignacion(false);

    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para pre-seleccionar posiciones
  const preSeleccionarPosiciones = (datos, partido, seleccionesLocal, seleccionesVisitante) => {
    let posicionLocal = 0;
    let posicionVisitante = 0;

    const porEquipo = {};
    datos.forEach(stat => {
      const equipoId = stat.jugadorPartido.equipo?._id || stat.jugadorPartido.equipo;
      if (!porEquipo[equipoId]) {
        porEquipo[equipoId] = [];
      }
      porEquipo[equipoId].push(stat);
    });

    Object.entries(porEquipo).forEach(([equipoId, stats]) => {
      const esLocal = equipoId === partido?.equipoLocal?._id;
      const esVisitante = equipoId === partido?.equipoVisitante?._id;

      if (esLocal || esVisitante) {
        const selecciones = esLocal ? seleccionesLocal : seleccionesVisitante;
        let posicion = esLocal ? posicionLocal : posicionVisitante;

        stats.forEach(stat => {
          if (posicion < 10) {
            selecciones[posicion] = stat.jugadorPartido._id;
            posicion++;
          }
        });

        if (esLocal) {
          posicionLocal = posicion;
        } else {
          posicionVisitante = posicion;
        }
      }
    });
  };

  // Función para cambiar estadísticas
  const cambiarEstadistica = (jugadorPartidoId, campo, delta) => {
    setEstadisticas(prev => ({
      ...prev,
      [jugadorPartidoId]: {
        ...prev[jugadorPartidoId],
        [campo]: Math.max(0, (prev[jugadorPartidoId]?.[campo] || 0) + delta)
      }
    }));
  };

  // Función para guardar estadísticas
  const guardarEstadisticas = async (partido) => {
    setGuardando(true);
    try {
      const promises = [];

      // Procesar selecciones del equipo local
      seleccionesLocal.forEach(jugadorPartidoId => {
        if (jugadorPartidoId) {
          const stats = estadisticas[jugadorPartidoId] || {};
          const data = {
            jugadorPartido: jugadorPartidoId,
            throws: stats.throws || 0,
            hits: stats.hits || 0,
            outs: stats.outs || 0,
            catches: stats.catches || 0,
            tipoCaptura: 'manual',
            fuente: tipoAutocompletado === 'automatico' && stats.fuente === 'autocompletado-automatico'
              ? 'manual-con-autocompletado-automatico'
              : tipoAutocompletado === 'manual-previo' && stats.fuente === 'autocompletado-manual-previo'
                ? 'manual-con-autocompletado-manual-previo'
                : 'captura-directa'
          };

          const existe = stats._id;
          let endpointUpdate, endpointCreate;

          if (existe) {
            endpointUpdate = stats.tipoCaptura === 'manual'
              ? `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual/${existe}`
              : `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/${existe}`;

            promises.push(
              fetch(endpointUpdate, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
              })
            );
          } else {
            endpointCreate = data.tipoCaptura === 'manual'
              ? 'https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual'
              : 'https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido';

            promises.push(
              fetch(endpointCreate, {
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
      });

      // Procesar selecciones del equipo visitante (similar al código anterior)
      seleccionesVisitante.forEach(jugadorPartidoId => {
        if (jugadorPartidoId) {
          const stats = estadisticas[jugadorPartidoId] || {};
          const data = {
            jugadorPartido: jugadorPartidoId,
            throws: stats.throws || 0,
            hits: stats.hits || 0,
            outs: stats.outs || 0,
            catches: stats.catches || 0,
            tipoCaptura: 'manual',
            fuente: tipoAutocompletado === 'automatico' && stats.fuente === 'autocompletado-automatico'
              ? 'manual-con-autocompletado-automatico'
              : tipoAutocompletado === 'manual-previo' && stats.fuente === 'autocompletado-manual-previo'
                ? 'manual-con-autocompletado-manual-previo'
                : 'captura-directa'
          };

          const existe = stats._id;
          let endpointUpdate, endpointCreate;

          if (existe) {
            endpointUpdate = stats.tipoCaptura === 'manual'
              ? `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual/${existe}`
              : `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/${existe}`;

            promises.push(
              fetch(endpointUpdate, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
              })
            );
          } else {
            endpointCreate = data.tipoCaptura === 'manual'
              ? 'https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual'
              : 'https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido';

            promises.push(
              fetch(endpointCreate, {
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
      });

      await Promise.all(promises);

      // Actualizar estadísticas de equipos
      try {
        const responseLocal = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/equipo-partido/actualizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            partidoId: partidoId,
            equipoId: partido.equipoLocal._id,
            creadoPor: 'usuario'
          })
        });

        const responseVisitante = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/equipo-partido/actualizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            partidoId: partidoId,
            equipoId: partido.equipoVisitante._id,
            creadoPor: 'usuario'
          })
        });

        if (responseLocal.ok && responseVisitante.ok) {
          console.log('✅ Estadísticas de equipos actualizadas correctamente');
        } else {
          console.warn('⚠️ Error actualizando estadísticas de equipos, pero las de jugadores se guardaron');
        }
      } catch (error) {
        console.error('❌ Error actualizando estadísticas de equipos:', error);
      }

      alert('Estadísticas guardadas correctamente');
      return true;

    } catch (error) {
      console.error('Error guardando estadísticas:', error);
      alert('Error al guardar las estadísticas: ' + error.message);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  return {
    // Estados
    jugadores,
    estadisticas,
    loading,
    guardando,
    seleccionesLocal,
    seleccionesVisitante,
    mostrarAsignacion,
    tipoAutocompletado,
    jugadoresSeleccionadosLocal,
    jugadoresSeleccionadosVisitante,
    asignandoJugadores,

    // Funciones
    setSeleccionesLocal,
    setSeleccionesVisitante,
    setMostrarAsignacion,
    setJugadoresSeleccionadosLocal,
    setJugadoresSeleccionadosVisitante,
    setAsignandoJugadores,
    cargarJugadoresYEstadisticas,
    cambiarEstadistica,
    guardarEstadisticas
  };
};
