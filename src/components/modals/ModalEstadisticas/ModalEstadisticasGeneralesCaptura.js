import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import { agregarJugadorPartido } from '../../../services/jugadorPartidoService';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';
import AsignacionJugadores from './components/AsignacionJugadores';
import CapturaEstadisticas from './components/CapturaEstadisticas';

export default function ModalEstadisticasGeneralesCaptura({
  partido,
  partidoId,
  token,
  onClose,
  onRefresh,
  datosIniciales = [],
  hayDatosAutomaticos = false
}) {
  const [jugadores, setJugadores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [seleccionesLocal, setSeleccionesLocal] = useState(Array(10).fill(''));
  const [seleccionesVisitante, setSeleccionesVisitante] = useState(Array(10).fill(''));

  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [jugadoresSeleccionadosLocal, setJugadoresSeleccionadosLocal] = useState(new Set());
  const [jugadoresSeleccionadosVisitante, setJugadoresSeleccionadosVisitante] = useState(new Set());
  const [asignandoJugadores, setAsignandoJugadores] = useState(false);

  const { relaciones: jugadoresLocal, loading: loadingLocal } = useJugadorEquipo({
    equipoId: partido?.equipoLocal?._id,
    token
  });
  const { relaciones: jugadoresVisitante, loading: loadingVisitante } = useJugadorEquipo({
    equipoId: partido?.equipoVisitante?._id,
    token
  });

  useEffect(() => {
    cargarJugadoresYEstadisticas();
  }, [partidoId, token]);

  useEffect(() => {
    if (mostrarAsignacion) {
      const nuevosSeleccionadosLocal = new Set();
      const nuevosSeleccionadosVisitante = new Set();

      jugadores.forEach(jugador => {
        const jugadorEquipoId = partido?.equipoLocal?._id;
        if (jugador.equipo === jugadorEquipoId || jugador.equipo?._id === jugadorEquipoId) {
          nuevosSeleccionadosLocal.add(jugador.jugador._id || jugador.jugador);
        }

        const jugadorEquipoVisitanteId = partido?.equipoVisitante?._id;
        if (jugador.equipo === jugadorEquipoVisitanteId || jugador.equipo?._id === jugadorEquipoVisitanteId) {
          nuevosSeleccionadosVisitante.add(jugador.jugador._id || jugador.jugador);
        }
      });

      setJugadoresSeleccionadosLocal(nuevosSeleccionadosLocal);
      setJugadoresSeleccionadosVisitante(nuevosSeleccionadosVisitante);
    }
  }, [mostrarAsignacion, jugadores, partido]);

  const cargarJugadoresYEstadisticas = async () => {
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
      }

      if (hayDatosAutomaticos && datosIniciales.length > 0) {
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
        let posicionLocal = 0;
        let posicionVisitante = 0;

        const porEquipo = {};
        datosIniciales.forEach(stat => {
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
            const selecciones = esLocal ? nuevasSeleccionesLocal : nuevasSeleccionesVisitante;
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

        setSeleccionesLocal(nuevasSeleccionesLocal);
        setSeleccionesVisitante(nuevasSeleccionesVisitante);
        setMostrarAsignacion(false);
      } else {
        const responseEstadisticas = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido-manual?partido=${partidoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (responseEstadisticas.ok) {
          const estadisticasData = await responseEstadisticas.json();
          const estadisticasMap = {};
          estadisticasData.forEach(stat => {
            estadisticasMap[stat.jugadorPartido._id] = stat;
          });
          setEstadisticas(estadisticasMap);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getJugadoresPorEquipo = (equipoId) => {
    if (!equipoId || !jugadores.length) return [];
    const filtrados = jugadores.filter(jugador => {
      const jugadorEquipoId = jugador.equipo?._id || jugador.equipo;
      return jugadorEquipoId === equipoId;
    });
    return filtrados;
  };

  const cambiarSeleccionJugador = (equipo, posicion, jugadorPartidoId) => {
    if (equipo === 'local') {
      const nuevasSelecciones = [...seleccionesLocal];
      nuevasSelecciones[posicion] = jugadorPartidoId;
      setSeleccionesLocal(nuevasSelecciones);
    } else {
      const nuevasSelecciones = [...seleccionesVisitante];
      nuevasSelecciones[posicion] = jugadorPartidoId;
      setSeleccionesVisitante(nuevasSelecciones);
    }
  };

  const cambiarEstadistica = (jugadorPartidoId, campo, delta) => {
    setEstadisticas(prev => ({
      ...prev,
      [jugadorPartidoId]: {
        ...prev[jugadorPartidoId],
        [campo]: Math.max(0, (prev[jugadorPartidoId]?.[campo] || 0) + delta)
      }
    }));
  };

  const guardar = async () => {
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
            fuente: hayDatosAutomaticos && stats.fuente === 'autocompletado-automatico'
              ? 'manual-con-autocompletado'
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

      // Procesar selecciones del equipo visitante
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
            fuente: hayDatosAutomaticos && stats.fuente === 'autocompletado-automatico'
              ? 'manual-con-autocompletado'
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

      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }

      onClose();
    } catch (error) {
      console.error('Error guardando estadísticas:', error);
      alert('Error al guardar las estadísticas: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const getNombreJugador = (jugador) => {
    if (!jugador) return 'Jugador desconocido';
    let nombre = '';
    if (jugador.nombre && jugador.apellido) {
      nombre = `${jugador.nombre} ${jugador.apellido}`;
    } else if (jugador.nombre) {
      const partes = jugador.nombre.trim().split(' ');
      if (partes.length > 1) {
        nombre = `${partes[0].charAt(0)}. ${partes[partes.length - 1]}`;
      } else {
        nombre = jugador.nombre;
      }
    } else if (jugador.name) {
      nombre = jugador.name;
    } else if (jugador.fullName) {
      nombre = jugador.fullName;
    } else {
      nombre = 'Sin nombre';
    }
    return nombre || 'Jugador';
  };

  const toggleJugadorLocal = (jugadorId) => {
    setJugadoresSeleccionadosLocal(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(jugadorId)) {
        nuevo.delete(jugadorId);
      } else {
        nuevo.add(jugadorId);
      }
      return nuevo;
    });
  };

  const toggleJugadorVisitante = (jugadorId) => {
    setJugadoresSeleccionadosVisitante(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(jugadorId)) {
        nuevo.delete(jugadorId);
      } else {
        nuevo.add(jugadorId);
      }
      return nuevo;
    });
  };

  const asignarJugadores = async () => {
    setAsignandoJugadores(true);
    try {
      const promises = [];

      const jugadoresActualesLocal = new Set(jugadores
        .filter(j => (j.equipo === partido.equipoLocal._id || j.equipo?._id === partido.equipoLocal._id))
        .map(j => j.jugador._id || j.jugador));

      const jugadoresActualesVisitante = new Set(jugadores
        .filter(j => (j.equipo === partido.equipoVisitante._id || j.equipo?._id === partido.equipoVisitante._id))
        .map(j => j.jugador._id || j.jugador));

      for (const jugadorId of jugadoresSeleccionadosLocal) {
        if (!jugadoresActualesLocal.has(jugadorId)) {
          promises.push(
            agregarJugadorPartido({
              partido: partidoId,
              jugador: jugadorId,
              equipo: partido.equipoLocal._id,
              creadoPor: 'usuario'
            }, token)
          );
        }
      }

      for (const jugadorId of jugadoresSeleccionadosVisitante) {
        if (!jugadoresActualesVisitante.has(jugadorId)) {
          promises.push(
            agregarJugadorPartido({
              partido: partidoId,
              jugador: jugadorId,
              equipo: partido.equipoVisitante._id,
              creadoPor: 'usuario'
            }, token)
          );
        }
      }

      for (const jugador of jugadores) {
        const jugadorId = jugador.jugador._id || jugador.jugador;
        const esLocal = jugador.equipo === partido.equipoLocal._id || jugador.equipo?._id === partido.equipoLocal._id;
        const esVisitante = jugador.equipo === partido.equipoVisitante._id || jugador.equipo?._id === partido.equipoVisitante._id;

        if (esLocal && !jugadoresSeleccionadosLocal.has(jugadorId)) {
          promises.push(
            fetch(`https://overtime-ddyl.onrender.com/api/jugador-partido/${jugador._id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            })
          );
        }

        if (esVisitante && !jugadoresSeleccionadosVisitante.has(jugadorId)) {
          promises.push(
            fetch(`https://overtime-ddyl.onrender.com/api/jugador-partido/${jugador._id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            })
          );
        }
      }

      await Promise.all(promises);
      alert(`✅ Asignación actualizada correctamente`);

      await cargarJugadoresYEstadisticas();
      setMostrarAsignacion(false);

    } catch (error) {
      console.error('Error asignando jugadores:', error);
      alert('Error al actualizar asignación: ' + error.message);
    } finally {
      setAsignandoJugadores(false);
    }
  };

  const hayJugadoresAsignados = jugadores.length > 0;

  if (loading) {
    return (
      <ModalLayout onClose={onClose}>
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando jugadores y estadísticas...</p>
        </div>
      </ModalLayout>
    );
  }

  return (
    <ModalLayout onClose={onClose}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {hayDatosAutomaticos
              ? '📝 Capturar Estadísticas (Autocompletadas)'
              : '📝 Capturar Estadísticas Generales'
            }
          </h2>
          <p className="text-gray-600 mt-2">
            {hayDatosAutomaticos
              ? `Se autocompletaron ${datosIniciales.length} estadísticas de datos automáticos. Modifica los valores según necesites.`
              : 'Ingresa las estadísticas directamente para todo el partido'
            }
          </p>
          {hayDatosAutomaticos && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-blue-800 text-sm">
                💡 <strong>Autocompletado:</strong> Los valores mostrados provienen de estadísticas calculadas automáticamente.
                Puedes modificarlos antes de guardar como estadísticas manuales.
              </p>
            </div>
          )}
        </div>

        {mostrarAsignacion ? (
          <AsignacionJugadores
            partido={partido}
            jugadoresLocal={jugadoresLocal}
            jugadoresVisitante={jugadoresVisitante}
            loadingLocal={loadingLocal}
            loadingVisitante={loadingVisitante}
            jugadoresSeleccionadosLocal={jugadoresSeleccionadosLocal}
            jugadoresSeleccionadosVisitante={jugadoresSeleccionadosVisitante}
            toggleJugadorLocal={toggleJugadorLocal}
            toggleJugadorVisitante={toggleJugadorVisitante}
            asignarJugadores={asignarJugadores}
            asignandoJugadores={asignandoJugadores}
            hayJugadoresAsignados={hayJugadoresAsignados}
            onClose={onClose}
          />
        ) : (
          <CapturaEstadisticas
            partido={partido}
            seleccionesLocal={seleccionesLocal}
            seleccionesVisitante={seleccionesVisitante}
            estadisticas={estadisticas}
            getJugadoresPorEquipo={getJugadoresPorEquipo}
            cambiarSeleccionJugador={cambiarSeleccionJugador}
            cambiarEstadistica={cambiarEstadistica}
            setMostrarAsignacion={setMostrarAsignacion}
            guardar={guardar}
            guardando={guardando}
            hayDatosAutomaticos={hayDatosAutomaticos}
          />
        )}
      </div>
    </ModalLayout>
  );
}
