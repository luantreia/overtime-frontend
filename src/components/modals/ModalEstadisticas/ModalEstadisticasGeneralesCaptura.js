import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import { agregarJugadorPartido } from '../../../services/jugadorPartidoService';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';

export default function ModalEstadisticasGeneralesCaptura({
  partido,
  partidoId,
  token,
  onClose,
}) {
  const [jugadores, setJugadores] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [seleccionesLocal, setSeleccionesLocal] = useState(Array(10).fill('')); // Hasta 10 posiciones
  const [seleccionesVisitante, setSeleccionesVisitante] = useState(Array(10).fill(''));

  // Estados para asignación de jugadores
  const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
  const [jugadoresSeleccionadosLocal, setJugadoresSeleccionadosLocal] = useState(new Set());
  const [jugadoresSeleccionadosVisitante, setJugadoresSeleccionadosVisitante] = useState(new Set());
  const [asignandoJugadores, setAsignandoJugadores] = useState(false);

  // Hooks para obtener jugadores disponibles de cada equipo
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

  // Inicializar checkboxes cuando se abre la vista de asignación
  useEffect(() => {
    if (mostrarAsignacion) {
      // Inicializar con los jugadores ya asignados
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
      // Cargar jugadores del partido
      const responseJugadores = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-partido?partido=${partidoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!responseJugadores.ok) {
        throw new Error('Error al cargar jugadores');
      }

      const jugadoresData = await responseJugadores.json();
      console.log('📊 Jugadores cargados:', jugadoresData);
      console.log('🏆 Equipo Local ID:', partido?.equipoLocal?._id);
      console.log('🏆 Equipo Visitante ID:', partido?.equipoVisitante?._id);

      setJugadores(jugadoresData);

      // Si no hay jugadores asignados, mostrar interfaz de asignación
      if (jugadoresData.length === 0) {
        setMostrarAsignacion(true);
      }

      // Cargar estadísticas existentes
      const responseEstadisticas = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido?partido=${partidoId}`, {
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
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener jugadores por equipo - corregida para manejar diferentes estructuras
  const getJugadoresPorEquipo = (equipoId) => {
    if (!equipoId || !jugadores.length) return [];

    console.log('🔍 Buscando jugadores para equipo:', equipoId);
    console.log('👥 Jugadores disponibles:', jugadores.map(j => ({
      id: j._id,
      equipoId: j.equipo?._id || j.equipo,
      equipoNombre: j.equipo?.nombre,
      jugadorNombre: j.jugador?.nombre
    })));

    const filtrados = jugadores.filter(jugador => {
      const jugadorEquipoId = jugador.equipo?._id || jugador.equipo;
      const coincide = jugadorEquipoId === equipoId;
      if (coincide) {
        console.log('✅ Jugador encontrado:', jugador.jugador?.nombre, 'para equipo:', equipoId);
      }
      return coincide;
    });

    console.log('📋 Jugadores filtrados para equipo', equipoId, ':', filtrados.length);
    return filtrados;
  };

  // Cambiar selección de jugador en una posición
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
            fuente: 'captura-directa'
          };

          // Verificar si ya existe
          const existe = stats._id;

          if (existe) {
            // Actualizar
            promises.push(
              fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/${existe}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
              })
            );
          } else {
            // Crear nuevo
            promises.push(
              fetch('https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido', {
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
            fuente: 'captura-directa'
          };

          // Verificar si ya existe
          const existe = stats._id;

          if (existe) {
            // Actualizar
            promises.push(
              fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido/${existe}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
              })
            );
          } else {
            // Crear nuevo
            promises.push(
              fetch('https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido', {
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

      // Después de guardar las estadísticas de jugadores, actualizar estadísticas de equipos
      console.log('🔄 Actualizando estadísticas agregadas de equipos...');
      
      try {
        // Actualizar estadísticas del equipo local
        const responseLocal = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/equipo-partido/actualizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            partidoId: partidoId,
            equipoId: partido.equipoLocal._id,
            creadoPor: 'usuario' // Cambiar por el usuario real si está disponible
          })
        });

        // Actualizar estadísticas del equipo visitante
        const responseVisitante = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/equipo-partido/actualizar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            partidoId: partidoId,
            equipoId: partido.equipoVisitante._id,
            creadoPor: 'usuario' // Cambiar por el usuario real si está disponible
          })
        });

        if (responseLocal.ok && responseVisitante.ok) {
          console.log('✅ Estadísticas de equipos actualizadas correctamente');
        } else {
          console.warn('⚠️ Error actualizando estadísticas de equipos, pero las de jugadores se guardaron');
        }
      } catch (error) {
        console.error('❌ Error actualizando estadísticas de equipos:', error);
        // No fallar la operación principal si esto falla
      }

      alert('Estadísticas guardadas correctamente');
      onClose();
    } catch (error) {
      console.error('Error guardando estadísticas:', error);
      alert('Error al guardar las estadísticas: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const getNombreJugador = (jugador) => {
    console.log('🎯 Procesando jugador:', jugador);

    if (!jugador) {
      console.log('❌ Jugador es null/undefined');
      return 'Jugador desconocido';
    }

    // Intentar diferentes formas de acceder al nombre
    let nombre = '';

    // Forma 1: objeto con nombre y apellido separados
    if (jugador.nombre && jugador.apellido) {
      nombre = `${jugador.nombre} ${jugador.apellido}`;
      console.log('✅ Nombre completo (separado):', nombre);
    }
    // Forma 2: nombre completo en un campo
    else if (jugador.nombre) {
      const partes = jugador.nombre.trim().split(' ');
      if (partes.length > 1) {
        nombre = `${partes[0].charAt(0)}. ${partes[partes.length - 1]}`;
        console.log('✅ Nombre abreviado:', nombre);
      } else {
        nombre = jugador.nombre;
        console.log('✅ Nombre simple:', nombre);
      }
    }
    // Forma 3: buscar en otras propiedades
    else if (jugador.name) {
      nombre = jugador.name;
      console.log('✅ Nombre (propiedad name):', nombre);
    }
    else if (jugador.fullName) {
      nombre = jugador.fullName;
      console.log('✅ Nombre (propiedad fullName):', nombre);
    }
    else {
      console.log('❌ No se encontró nombre en:', Object.keys(jugador));
      nombre = 'Sin nombre';
    }

    return nombre || 'Jugador';
  };

  // Funciones para asignación de jugadores
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
      
      // Determinar qué jugadores agregar y cuáles quitar
      const jugadoresActualesLocal = new Set(jugadores
        .filter(j => (j.equipo === partido.equipoLocal._id || j.equipo?._id === partido.equipoLocal._id))
        .map(j => j.jugador._id || j.jugador));
      
      const jugadoresActualesVisitante = new Set(jugadores
        .filter(j => (j.equipo === partido.equipoVisitante._id || j.equipo?._id === partido.equipoVisitante._id))
        .map(j => j.jugador._id || j.jugador));

      // Agregar nuevos jugadores locales
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

      // Agregar nuevos jugadores visitantes
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

      // Quitar jugadores que ya no están seleccionados (eliminar JugadorPartido)
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
      
      const totalJugadores = jugadoresSeleccionadosLocal.size + jugadoresSeleccionadosVisitante.size;
      alert(`✅ Asignación actualizada correctamente (${totalJugadores} jugadores)`);

      // Recargar datos y mostrar interfaz de captura
      await cargarJugadoresYEstadisticas();
      setMostrarAsignacion(false);

    } catch (error) {
      console.error('Error asignando jugadores:', error);
      alert('Error al actualizar asignación: ' + error.message);
    } finally {
      setAsignandoJugadores(false);
    }
  };

  // Determinar si hay jugadores ya asignados para cambiar textos
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
            {hayJugadoresAsignados ? 'Editar Asignación de Jugadores' : 'Asignar Jugadores al Partido'}
          </h2>
          <p className="text-gray-600 mt-2">
            {hayJugadoresAsignados 
              ? 'Modifica la lista de jugadores que participaron en este partido'
              : 'Selecciona los jugadores que participaron en este partido'
            }
          </p>
        </div>

        {mostrarAsignacion ? (
          // Interfaz de asignación de jugadores
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Equipo Local */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  {partido?.equipoLocal?.escudo && (
                    <img
                      src={partido.equipoLocal.escudo}
                      alt={`Escudo ${partido.equipoLocal.nombre}`}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-blue-800">
                      {partido?.equipoLocal?.nombre || 'Equipo Local'}
                    </h3>
                    <p className="text-xs text-blue-600">
                      {jugadoresSeleccionadosLocal.size} de {jugadoresLocal.length} jugadores seleccionados
                    </p>
                  </div>
                </div>

                {loadingLocal ? (
                  <p className="text-gray-600 text-sm">Cargando jugadores...</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {jugadoresLocal.map(jugador => (
                      <label key={jugador.jugador._id} className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jugadoresSeleccionadosLocal.has(jugador.jugador._id)}
                          onChange={() => toggleJugadorLocal(jugador.jugador._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {jugador.jugador.numero ? `#${jugador.jugador.numero} ` : ''}
                          {jugador.jugador.nombre}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipo Visitante */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  {partido?.equipoVisitante?.escudo && (
                    <img
                      src={partido.equipoVisitante.escudo}
                      alt={`Escudo ${partido.equipoVisitante.nombre}`}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-red-800">
                      {partido?.equipoVisitante?.nombre || 'Equipo Visitante'}
                    </h3>
                    <p className="text-xs text-red-600">
                      {jugadoresSeleccionadosVisitante.size} de {jugadoresVisitante.length} jugadores seleccionados
                    </p>
                  </div>
                </div>

                {loadingVisitante ? (
                  <p className="text-gray-600 text-sm">Cargando jugadores...</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {jugadoresVisitante.map(jugador => (
                      <label key={jugador.jugador._id} className="flex items-center gap-3 p-2 hover:bg-red-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jugadoresSeleccionadosVisitante.has(jugador.jugador._id)}
                          onChange={() => toggleJugadorVisitante(jugador.jugador._id)}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm">
                          {jugador.jugador.numero ? `#${jugador.jugador.numero} ` : ''}
                          {jugador.jugador.nombre}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={asignarJugadores}
                disabled={asignandoJugadores}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {asignandoJugadores 
                  ? 'Actualizando...' 
                  : (hayJugadoresAsignados ? 'Actualizar Asignación' : 'Asignar Jugadores')
                }
              </button>
            </div>
          </div>
        ) : (
          // Interfaz de captura de estadísticas (existente)
          <>
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button
                onClick={() => setMostrarAsignacion(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                ✏️ Editar Jugadores
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipo Local */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              {partido?.equipoLocal?.escudo && (
                <img
                  src={partido.equipoLocal.escudo}
                  alt={`Escudo ${partido.equipoLocal.nombre}`}
                  className="w-8 h-8 object-contain"
                />
              )}
              <h3 className="text-lg font-bold text-blue-800">
                {partido?.equipoLocal?.nombre || 'Equipo Local'}
              </h3>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 10 }, (_, index) => {
                const posicion = index + 1;
                const jugadorSeleccionadoId = seleccionesLocal[index];
                const jugadorSeleccionado = jugadores.find(j => j._id === jugadorSeleccionadoId);
                const jugadoresEquipo = getJugadoresPorEquipo(partido?.equipoLocal?._id);

                return (
                  <div key={`local-${index}`} className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-600 w-8">
                        #{posicion}
                      </span>
                      <select
                        value={jugadorSeleccionadoId || ''}
                        onChange={(e) => cambiarSeleccionJugador('local', index, e.target.value)}
                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar jugador</option>
                        {jugadoresEquipo.length > 0 ? (
                          jugadoresEquipo.map(jugador => {
                            const nombre = jugador.jugador?.nombre || 'Sin nombre';
                            const numero = jugador.jugador?.numero || jugador.numero || '';
                            const displayText = numero ? `#${numero} ${nombre}` : nombre;

                            return (
                              <option key={jugador._id} value={jugador._id}>
                                {displayText}
                              </option>
                            );
                          })
                        ) : (
                          <option disabled>No hay jugadores disponibles</option>
                        )}
                      </select>
                    </div>

                    {jugadorSeleccionadoId && (
                      <EstadisticasJugador
                        jugadorPartidoId={jugadorSeleccionadoId}
                        estadisticas={estadisticas[jugadorSeleccionadoId] || {}}
                        onCambiarEstadistica={cambiarEstadistica}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Equipo Visitante */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              {partido?.equipoVisitante?.escudo && (
                <img
                  src={partido.equipoVisitante.escudo}
                  alt={`Escudo ${partido.equipoVisitante.nombre}`}
                  className="w-8 h-8 object-contain"
                />
              )}
              <h3 className="text-lg font-bold text-red-800">
                {partido?.equipoVisitante?.nombre || 'Equipo Visitante'}
              </h3>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 10 }, (_, index) => {
                const posicion = index + 1;
                const jugadorSeleccionadoId = seleccionesVisitante[index];
                const jugadorSeleccionado = jugadores.find(j => j._id === jugadorSeleccionadoId);
                const jugadoresEquipo = getJugadoresPorEquipo(partido?.equipoVisitante?._id);

                return (
                  <div key={`visitante-${index}`} className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-600 w-8">
                        #{posicion}
                      </span>
                      <select
                        value={jugadorSeleccionadoId || ''}
                        onChange={(e) => cambiarSeleccionJugador('visitante', index, e.target.value)}
                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="">Seleccionar jugador</option>
                        {jugadoresEquipo.length > 0 ? (
                          jugadoresEquipo.map(jugador => {
                            const nombre = jugador.jugador?.nombre || 'Sin nombre';
                            const numero = jugador.jugador?.numero || jugador.numero || '';
                            const displayText = numero ? `#${numero} ${nombre}` : nombre;

                            return (
                              <option key={jugador._id} value={jugador._id}>
                                {displayText}
                              </option>
                            );
                          })
                        ) : (
                          <option disabled>No hay jugadores disponibles</option>
                        )}
                      </select>
                    </div>

                    {jugadorSeleccionadoId && (
                      <EstadisticasJugador
                        jugadorPartidoId={jugadorSeleccionadoId}
                        estadisticas={estadisticas[jugadorSeleccionadoId] || {}}
                        onCambiarEstadistica={cambiarEstadistica}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {guardando ? 'Guardando...' : 'Guardar Estadísticas'}
              </button>
            </div>
          </>
        )}
      </div>
    </ModalLayout>
  );
}

// Componente auxiliar para mostrar estadísticas de un jugador
function EstadisticasJugador({ jugadorPartidoId, estadisticas, onCambiarEstadistica }) {
  return (
    <div className="grid grid-cols-4 gap-2 text-xs">
      {/* Throws */}
      <div className="text-center">
        <div className="text-gray-600 mb-1">Throws</div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onCambiarEstadistica(jugadorPartidoId, 'throws', -1)}
            className="w-5 h-5 bg-red-500 text-white rounded text-xs flex items-center justify-center"
          >
            -
          </button>
          <span className="w-6 text-center font-semibold">{estadisticas.throws || 0}</span>
          <button
            onClick={() => onCambiarEstadistica(jugadorPartidoId, 'throws', 1)}
            className="w-5 h-5 bg-green-500 text-white rounded text-xs flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Hits */}
      <div className="text-center">
        <div className="text-gray-600 mb-1">Hits</div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onCambiarEstadistica(jugadorPartidoId, 'hits', -1)}
            className="w-5 h-5 bg-red-500 text-white rounded text-xs flex items-center justify-center"
          >
            -
          </button>
          <span className="w-6 text-center font-semibold">{estadisticas.hits || 0}</span>
          <button
            onClick={() => onCambiarEstadistica(jugadorPartidoId, 'hits', 1)}
            className="w-5 h-5 bg-green-500 text-white rounded text-xs flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Outs */}
      <div className="text-center">
        <div className="text-gray-600 mb-1">Outs</div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onCambiarEstadistica(jugadorPartidoId, 'outs', -1)}
            className="w-5 h-5 bg-red-500 text-white rounded text-xs flex items-center justify-center"
          >
            -
          </button>
          <span className="w-6 text-center font-semibold">{estadisticas.outs || 0}</span>
          <button
            onClick={() => onCambiarEstadistica(jugadorPartidoId, 'outs', 1)}
            className="w-5 h-5 bg-green-500 text-white rounded text-xs flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Catches */}
      <div className="text-center">
        <div className="text-gray-600 mb-1">Catches</div>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onCambiarEstadistica(jugadorPartidoId, 'catches', -1)}
            className="w-5 h-5 bg-red-500 text-white rounded text-xs flex items-center justify-center"
          >
            -
          </button>
          <span className="w-6 text-center font-semibold">{estadisticas.catches || 0}</span>
          <button
            onClick={() => onCambiarEstadistica(jugadorPartidoId, 'catches', 1)}
            className="w-5 h-5 bg-green-500 text-white rounded text-xs flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
