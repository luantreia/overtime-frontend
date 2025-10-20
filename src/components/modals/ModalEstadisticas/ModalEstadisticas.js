import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import EncabezadoEstadisticas from './EncabezadoEstadisticas';
import SelectorSet from './SelectorSet'; 
import EquiposEstadisticas from './EquipoEstadisticas';
import { obtenerJugadoresPartido, agregarJugadorPartido } from '../../../services/jugadorPartidoService';

export default function ModalEstadisticasCaptura({
  partido,
  partidoId,
  token,
  onClose,
  actualizarSetsLocales,
  agregarSetAPartido,
  actualizarSetDePartido,
  refrescarPartidoSeleccionado,
  eliminarSetDePartido
}) {
  const [numeroSetSeleccionado, setNumeroSetSeleccionado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [partidoLocal, setPartidoLocal] = useState(partido);
  
  // Estado para manejar jugadores y estadísticas por set
  const [jugadoresPorSet, setJugadoresPorSet] = useState({});
  
  // Estado para guardar snapshot inicial de las estadísticas (para comparar cambios)
  const [estadisticasIniciales, setEstadisticasIniciales] = useState({});

  // Nuevo: Estado para modal de confirmación de estadísticas manuales
  const [mostrarConfirmacionManual, setMostrarConfirmacionManual] = useState(false);
  const [estadisticasManualesDetectadas, setEstadisticasManualesDetectadas] = useState([]);
  const [setDataPendiente, setSetDataPendiente] = useState(null);

  const setsLocales = partidoLocal?.sets || [];
  // Simplificar: usar el set seleccionado directamente
  const estadisticasSet = setsLocales.find(s => s.numeroSet.toString() === numeroSetSeleccionado);

  useEffect(() => {
    setPartidoLocal(partido);
  }, [partido]);

  useEffect(() => {
    if (setsLocales.length > 0 && !numeroSetSeleccionado) {
      // Seleccionar el set con el número más alto (el más reciente)
      const ultimoSet = setsLocales.reduce((max, set) => 
        set.numeroSet > max.numeroSet ? set : max
      );
      setNumeroSetSeleccionado(ultimoSet.numeroSet.toString());
    }
  }, [setsLocales.length]); // Solo depender de la cantidad de sets

  useEffect(() => {
    if (partidoLocal && typeof actualizarSetsLocales === 'function') {
      // Solo actualizar si realmente cambió el número de sets
      const setsActuales = partidoLocal.sets || [];
      actualizarSetsLocales(setsActuales);
    }
  }, [partidoLocal?.sets ? partidoLocal.sets.length : 0]); // Usar operador ternario para evitar undefined

  // Cargar estadísticas existentes cuando se selecciona un set
  useEffect(() => {
    const cargarEstadisticasSet = async () => {
      if (!numeroSetSeleccionado || !estadisticasSet?._id) return;
      
      try {
        console.log('🔄 Cargando estadísticas del set:', estadisticasSet._id);
        
        // Obtener estadísticas del set desde el backend
        const response = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set?set=${estadisticasSet._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          console.warn('⚠️ No se pudieron cargar estadísticas del set');
          return;
        }
        
        const estadisticasExistentes = await response.json();
        console.log('📊 Estadísticas existentes:', estadisticasExistentes);
        
        if (estadisticasExistentes.length === 0) {
          console.log('ℹ️ No hay estadísticas guardadas para este set');
          return;
        }
        
        // Reconstruir el estado de jugadoresPorSet con las estadísticas existentes
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
        
        // Guardar snapshot inicial para comparar cambios
        setEstadisticasIniciales(prev => ({
          ...prev,
          [setKey]: JSON.parse(JSON.stringify(nuevoEstado)) // Deep copy
        }));
        
        console.log('✅ Estadísticas cargadas correctamente');
      } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
      }
    };
    
    cargarEstadisticasSet();
  }, [numeroSetSeleccionado, estadisticasSet?._id, token]);

  // Función para verificar si hay estadísticas manuales en el partido
  const verificarEstadisticasManuales = async () => {
    try {
      const response = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido?partido=${partidoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) return [];

      const estadisticas = await response.json();
      return estadisticas.filter(stat => stat.tipoCaptura === 'manual');
    } catch (error) {
      console.error('Error verificando estadísticas manuales:', error);
      return [];
    }
  };

  const actualizarSetSeleccionado = (cambios) => {
    if (!estadisticasSet) return;
    // Simplificar: solo actualizar el estado local del set
    setPartidoLocal(prev => {
      if (!prev || !prev.sets) return prev;
      const nuevosSets = prev.sets.map(s =>
        s.numeroSet === estadisticasSet.numeroSet ? { ...s, ...cambios } : s
      );
      return { ...prev, sets: nuevosSets };
    });
  };

  const asignarJugador = async (indexLocal, jugadorId, equipoId) => {
    if (!numeroSetSeleccionado || !jugadorId) return;
    
    try {
      // 1. Crear JugadorPartido si no existe
      const jugadorPartidoData = {
        partido: partidoId,
        jugador: jugadorId,
        equipo: equipoId,
        estado: 'aceptado',
        rol: 'jugador'
      };
      
      console.log('🏃 Creando JugadorPartido:', jugadorPartidoData);
      
      // Verificar si ya existe
      const jugadoresExistentes = await obtenerJugadoresPartido(partidoId, token);
      const yaExiste = jugadoresExistentes.find(jp => 
        jp.jugador === jugadorId && jp.equipo === equipoId
      );
      
      let jugadorPartidoId;
      if (!yaExiste) {
        const nuevoJugadorPartido = await agregarJugadorPartido(jugadorPartidoData, token);
        jugadorPartidoId = nuevoJugadorPartido._id;
        console.log('✅ JugadorPartido creado:', nuevoJugadorPartido);
      } else {
        jugadorPartidoId = yaExiste._id;
        console.log('ℹ️ JugadorPartido ya existe:', yaExiste);
      }
      
      // 2. Actualizar estado local
      const setKey = `${numeroSetSeleccionado}`;
      
      const estadisticasPrevias = jugadoresPorSet[setKey]?.[equipoId]?.[indexLocal]?.estadisticas || { throws: 0, hits: 0, outs: 0, catches: 0 };
      
      setJugadoresPorSet(prev => {
        const newState = { ...prev };
        
        // Inicializar el set si no existe
        if (!newState[setKey]) {
          newState[setKey] = {};
        }
        
        // Inicializar el equipo si no existe
        if (!newState[setKey][equipoId]) {
          newState[setKey][equipoId] = [];
        }
        
        // Crear una copia del array de jugadores del equipo
        const jugadoresEquipo = [...newState[setKey][equipoId]];
        
        // Asegurar que el array tenga al menos indexLocal + 1 elementos
        while (jugadoresEquipo.length <= indexLocal) {
          jugadoresEquipo.push({
            jugadorId: '',
            jugadorPartidoId: null,
            estadisticas: { throws: 0, hits: 0, outs: 0, catches: 0 }
          });
        }
        
        // Asignar el jugador en el índice específico
        jugadoresEquipo[indexLocal] = {
          jugadorId: jugadorId,
          jugadorPartidoId: jugadorPartidoId,
          estadisticas: estadisticasPrevias
        };
        
        newState[setKey][equipoId] = jugadoresEquipo;
        
        return newState;
      });
      
    } catch (error) {
      console.error('❌ Error asignando jugador:', error);
      alert('Error al asignar jugador: ' + error.message);
    }
  };

  const cambiarEstadistica = (jugadorId, campo, delta) => {
    if (!numeroSetSeleccionado || !jugadorId) return;
    
    const setKey = `${numeroSetSeleccionado}`;
    
    setJugadoresPorSet(prev => {
      const newState = { ...prev };
      
      // Buscar el jugador en ambos equipos
      for (const equipoId in newState[setKey] || {}) {
        const jugadoresEquipo = newState[setKey][equipoId];
        const jugadorIndex = jugadoresEquipo.findIndex(j => j.jugadorId === jugadorId);
        
        if (jugadorIndex !== -1) {
          const jugadoresActualizados = [...jugadoresEquipo];
          const estadisticasActuales = jugadoresActualizados[jugadorIndex].estadisticas;
          const valorActual = estadisticasActuales[campo] || 0;
          
          jugadoresActualizados[jugadorIndex] = {
            ...jugadoresActualizados[jugadorIndex],
            estadisticas: {
              ...estadisticasActuales,
              [campo]: Math.max(0, valorActual + delta)
            }
          };
          
          newState[setKey][equipoId] = jugadoresActualizados;
          
          console.log(`📊 Estadística actualizada: ${campo} = ${Math.max(0, valorActual + delta)} para jugador ${jugadorId}`);
          break;
        }
      }
      
      return newState;
    });
  };

  const setGanadorSetLocal = (ganador) => {
    actualizarSetSeleccionado({ ganadorSet: ganador });
  };

  // Función para comparar estadísticas y detectar cambios
  const obtenerCambios = (setKey) => {
    const jugadoresActuales = jugadoresPorSet[setKey] || {};
    const jugadoresIniciales = estadisticasIniciales[setKey] || {};
    const cambios = [];
    
    // Revisar jugadores actuales
    for (const equipoId in jugadoresActuales) {
      const jugadoresEquipoActual = jugadoresActuales[equipoId];
      const jugadoresEquipoInicial = jugadoresIniciales[equipoId] || [];
      
      for (let i = 0; i < jugadoresEquipoActual.length; i++) {
        const jugadorActual = jugadoresEquipoActual[i];
        const jugadorInicial = jugadoresEquipoInicial[i];
        
        // Verificar si es un jugador nuevo o si cambió
        if (!jugadorInicial || 
            jugadorInicial.jugadorId !== jugadorActual.jugadorId ||
            jugadorInicial.estadisticas.throws !== jugadorActual.estadisticas.throws ||
            jugadorInicial.estadisticas.hits !== jugadorActual.estadisticas.hits ||
            jugadorInicial.estadisticas.outs !== jugadorActual.estadisticas.outs ||
            jugadorInicial.estadisticas.catches !== jugadorActual.estadisticas.catches) {
          
          cambios.push({
            equipoId,
            jugador: jugadorActual,
            esNuevo: !jugadorInicial || jugadorInicial.jugadorId !== jugadorActual.jugadorId
          });
        }
      }
    }
    
    return cambios;
  };

  const guardar = async (forzarRecalculo = false) => {
    if (!estadisticasSet) return alert('Seleccione un set para guardar');
    
    console.log('💾 Guardando estadísticas del set:', {
      partidoId,
      numeroSet: estadisticasSet.numeroSet,
      estadisticasSet,
      ganadorSet: estadisticasSet.ganadorSet || 'pendiente',
      forzarRecalculo
    });
    
    setGuardando(true);
    try {
      // Verificar estadísticas manuales si no se está forzando
      if (!forzarRecalculo) {
        const manuales = await verificarEstadisticasManuales();
        if (manuales.length > 0) {
          setEstadisticasManualesDetectadas(manuales);
          setSetDataPendiente({
            numeroSet: estadisticasSet.numeroSet,
            setData: {
              ganadorSet: estadisticasSet.ganadorSet || 'pendiente',
              estadoSet: estadisticasSet.ganadorSet !== 'pendiente' ? 'finalizado' : 'en_juego'
            }
          });
          setMostrarConfirmacionManual(true);
          setGuardando(false);
          return;
        }
      }
      // 1. Actualizar información básica del set SOLO si tiene _id
      if (estadisticasSet._id) {
        const datosSet = {
          ganadorSet: estadisticasSet.ganadorSet || 'pendiente',
          estadoSet: estadisticasSet.ganadorSet !== 'pendiente' ? 'finalizado' : 'en_juego'
        };
        
        console.log('📤 Actualizando SetPartido directamente:', estadisticasSet._id, datosSet);
        
        // Actualizar directamente con el ID del set
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/set-partido/${estadisticasSet._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosSet),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Error actualizando set:', errorText);
          throw new Error(`Error al actualizar set: ${res.status}`);
        }
        
        console.log('✅ Set actualizado correctamente');
      } else {
        console.warn('⚠️ Set sin _id, saltando actualización de SetPartido');
      }
      
      // 2. Detectar solo los cambios en las estadísticas
      const setKey = `${estadisticasSet.numeroSet}`;
      const cambios = obtenerCambios(setKey);
      
      if (cambios.length === 0) {
        console.log('ℹ️ No hay cambios en las estadísticas, saltando guardado');
        alert('Set actualizado (sin cambios en estadísticas)');
        setGuardando(false);
        return;
      }
      
      console.log(`📊 Guardando ${cambios.length} cambio(s) en estadísticas:`, cambios);
      
      // 3. Obtener TODAS las estadísticas existentes del set
      const todasEstadisticasResponse = await fetch(
        `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set?set=${estadisticasSet._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const todasEstadisticasExistentes = todasEstadisticasResponse.ok ? await todasEstadisticasResponse.json() : [];
      console.log('📋 Estadísticas existentes en el set:', todasEstadisticasExistentes);
      
      // 4. Obtener IDs de jugadores actuales
      const jugadoresActualesIds = new Set();
      for (const equipoId in jugadoresPorSet[setKey] || {}) {
        for (const jug of jugadoresPorSet[setKey][equipoId]) {
          if (jug.jugadorPartidoId) {
            jugadoresActualesIds.add(jug.jugadorPartidoId);
          }
        }
      }
      
      // 5. Eliminar registros de jugadores que ya no están en el set
      for (const estatExistente of todasEstadisticasExistentes) {
        const jugadorPartidoId = estatExistente.jugadorPartido._id || estatExistente.jugadorPartido;
        
        if (!jugadoresActualesIds.has(jugadorPartidoId)) {
          console.log('🗑️ Eliminando registro de jugador que ya no está:', estatExistente._id);
          
          try {
            await fetch(
              `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set/${estatExistente._id}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log('✅ Registro eliminado');
          } catch (error) {
            console.error('❌ Error eliminando registro:', error);
          }
        }
      }
      
      // 6. Procesar solo los cambios detectados
      for (const cambio of cambios) {
        const { equipoId, jugador, esNuevo } = cambio;
        
        if (jugador.jugadorId && jugador.jugadorPartidoId) {
            try {
              // Buscar si existe un registro para este jugadorPartido
              const registroExistente = todasEstadisticasExistentes.find(
                e => (e.jugadorPartido._id || e.jugadorPartido) === jugador.jugadorPartidoId
              );
              
              const estadisticasData = {
                set: estadisticasSet._id,
                jugadorPartido: jugador.jugadorPartidoId,
                jugador: jugador.jugadorId,
                equipo: equipoId,
                throws: jugador.estadisticas.throws || 0,
                hits: jugador.estadisticas.hits || 0,
                outs: jugador.estadisticas.outs || 0,
                catches: jugador.estadisticas.catches || 0
              };
              
              if (registroExistente) {
                // Registro existe: ACTUALIZAR estadísticas
                console.log('🔄 Actualizando estadísticas existentes:', registroExistente._id);
                
                const updateResponse = await fetch(
                  `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set/${registroExistente._id}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      throws: estadisticasData.throws,
                      hits: estadisticasData.hits,
                      outs: estadisticasData.outs,
                      catches: estadisticasData.catches
                    }),
                  }
                );
                
                if (!updateResponse.ok) {
                  const errorText = await updateResponse.text();
                  console.error('❌ Error actualizando:', updateResponse.status, errorText);
                  throw new Error(`Error ${updateResponse.status}: ${errorText}`);
                }
                
                const resultado = await updateResponse.json();
                console.log('✅ Estadísticas actualizadas para jugador:', jugador.jugadorId, resultado);
                
              } else {
                // No existe registro: CREAR nuevo
                console.log('📈 Creando nuevas estadísticas:', estadisticasData);
                
                const createResponse = await fetch('https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(estadisticasData),
                });
                
                if (!createResponse.ok) {
                  const errorText = await createResponse.text();
                  console.error('❌ Error creando:', createResponse.status, errorText);
                  throw new Error(`Error ${createResponse.status}: ${errorText}`);
                }
                
                const resultado = await createResponse.json();
                console.log('✅ Estadísticas creadas para jugador:', jugador.jugadorId, resultado);
              }
              
            } catch (error) {
              console.error('❌ Error guardando estadísticas de jugador:', jugador.jugadorId, error);
              // Continuar con los demás jugadores aunque uno falle
            }
        } else {
          console.warn('⚠️ Jugador sin jugadorId o jugadorPartidoId:', jugador);
        }
      }
      
      // 4. Actualizar snapshot inicial con el estado actual
      setEstadisticasIniciales(prev => ({
        ...prev,
        [setKey]: JSON.parse(JSON.stringify(jugadoresPorSet[setKey]))
      }));
      
      // 5. Refrescar datos del partido
      const refreshed = await refrescarPartidoSeleccionado(partidoId);
      setPartidoLocal(refreshed);
      
      alert(`Set actualizado correctamente (${cambios.length} cambio${cambios.length !== 1 ? 's' : ''} guardado${cambios.length !== 1 ? 's' : ''})`);
    } catch (e) {
      console.error('Error guardando set:', e);
      alert('Error al guardar set: ' + e.message);
    } finally {
      setGuardando(false);
    }
  };

  const copiarJugadoresDeSetAnterior = async () => {
    if (!numeroSetSeleccionado) return;
    
    const setActual = parseInt(numeroSetSeleccionado);
    const setAnterior = setActual - 1;
    
    if (setAnterior < 1) {
      alert('No hay set anterior para copiar');
      return;
    }
    
    const setAnteriorKey = `${setAnterior}`;
    const jugadoresSetAnterior = jugadoresPorSet[setAnteriorKey];
    
    if (!jugadoresSetAnterior || Object.keys(jugadoresSetAnterior).length === 0) {
      // Si no hay jugadores en memoria, intentar cargarlos desde el backend
      const setAnteriorObj = setsLocales.find(s => s.numeroSet === setAnterior);
      
      if (!setAnteriorObj?._id) {
        alert('No hay set anterior para copiar');
        return;
      }
      
      try {
        console.log('🔄 Cargando jugadores del set anterior desde el backend...');
        
        const response = await fetch(`https://overtime-ddyl.onrender.com/api/estadisticas/jugador-set?set=${setAnteriorObj._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok || (await response.clone().json()).length === 0) {
          alert('No hay jugadores en el set anterior para copiar');
          return;
        }
        
        const estadisticasSetAnterior = await response.json();
        
        // Reconstruir el estado con los jugadores del set anterior
        const setActualKey = `${setActual}`;
        const nuevoEstado = {};
        
        for (const stat of estadisticasSetAnterior) {
          const equipoId = stat.equipo._id || stat.equipo;
          
          if (!nuevoEstado[equipoId]) {
            nuevoEstado[equipoId] = [];
          }
          
          nuevoEstado[equipoId].push({
            jugadorId: stat.jugador._id || stat.jugador,
            jugadorPartidoId: stat.jugadorPartido._id || stat.jugadorPartido,
            estadisticas: { throws: 0, hits: 0, outs: 0, catches: 0 } // Reiniciar estadísticas
          });
        }
        
        setJugadoresPorSet(prev => ({
          ...prev,
          [setActualKey]: nuevoEstado
        }));
        
        // Guardar snapshot inicial de los jugadores copiados
        setEstadisticasIniciales(prev => ({
          ...prev,
          [setActualKey]: JSON.parse(JSON.stringify(nuevoEstado))
        }));
        
        console.log('✅ Jugadores copiados del set anterior');
        alert(`Jugadores copiados del set ${setAnterior} al set ${setActual}`);
        
      } catch (error) {
        console.error('❌ Error copiando jugadores:', error);
        alert('Error al copiar jugadores del set anterior');
      }
      
      return;
    }
    
    // Si hay jugadores en memoria, copiarlos normalmente
    const setActualKey = `${setActual}`;
    
    setJugadoresPorSet(prev => {
      const newState = { ...prev };
      
      // Copiar jugadores del set anterior al actual, reiniciando estadísticas
      newState[setActualKey] = {};
      
      for (const equipoId in jugadoresSetAnterior) {
        newState[setActualKey][equipoId] = jugadoresSetAnterior[equipoId].map(jugador => ({
          jugadorId: jugador.jugadorId,
          jugadorPartidoId: jugador.jugadorPartidoId, // Mantener el jugadorPartidoId
          estadisticas: { throws: 0, hits: 0, outs: 0, catches: 0 } // Reiniciar estadísticas
        }));
      }
      
      return newState;
    });
    
    // Guardar snapshot inicial de los jugadores copiados
    setEstadisticasIniciales(prev => {
      const newState = { ...prev };
      newState[setActualKey] = {};
      
      for (const equipoId in jugadoresSetAnterior) {
        newState[setActualKey][equipoId] = jugadoresSetAnterior[equipoId].map(jugador => ({
          jugadorId: jugador.jugadorId,
          jugadorPartidoId: jugador.jugadorPartidoId,
          estadisticas: { throws: 0, hits: 0, outs: 0, catches: 0 }
        }));
      }
      
      return newState;
    });
    
    console.log('✅ Jugadores copiados del set anterior desde memoria');
    alert(`Jugadores copiados del set ${setAnterior} al set ${setActual}`);
  };

  const handleAgregarSet = async () => {
    // Calcular el siguiente número de set disponible
    const numerosExistentes = setsLocales.map(s => s.numeroSet).sort((a, b) => a - b);
    let numero = 1;
    
    // Encontrar el primer número disponible
    for (let i = 0; i < numerosExistentes.length; i++) {
      if (numerosExistentes[i] === numero) {
        numero++;
      } else {
        break;
      }
    }
    
    console.log('Creando set con número:', numero);
    console.log('Sets existentes:', numerosExistentes);
    
    const setData = {
      numeroSet: numero,
      ganadorSet: 'pendiente',
      estadoSet: 'en_juego'
    };
    
    try {
      const creado = await agregarSetAPartido(partidoId, setData);
      if (creado?.numeroSet) {
        setPartidoLocal(prev => ({ 
          ...prev, 
          sets: [...(prev?.sets || []), creado] 
        }));
        setNumeroSetSeleccionado(creado.numeroSet.toString());
      }
    } catch (e) {
      console.error('Error agregando set:', e);
      alert('Error al crear el set: ' + e.message);
    }
  };

  const confirmarRecalculo = async () => {
    if (setDataPendiente) {
      await guardar(true); // Forzar recalculo
    }
    setMostrarConfirmacionManual(false);
    setEstadisticasManualesDetectadas([]);
    setSetDataPendiente(null);
  };

  const cancelarRecalculo = () => {
    setMostrarConfirmacionManual(false);
    setEstadisticasManualesDetectadas([]);
    setSetDataPendiente(null);
    setGuardando(false);
  };

  const eliminarSet = async () => {
    if (!numeroSetSeleccionado) return alert('Seleccione un set para eliminar');

    const ultimoNumeroSet = Math.max(...setsLocales.map(s => s.numeroSet));

    if (Number(numeroSetSeleccionado) !== ultimoNumeroSet) {
      return alert('Solo se puede eliminar el último set.');
    }

    const confirm = window.confirm(`¿Seguro que querés eliminar el Set ${numeroSetSeleccionado}? Esta acción no se puede deshacer.`);
    if (!confirm) return;

    setEliminando(true);
    try {
      const exito = await eliminarSetDePartido(partidoId, Number(numeroSetSeleccionado));
      if (exito) {
        const nuevosSets = partidoLocal.sets.filter(s => s.numeroSet !== Number(numeroSetSeleccionado));
        setPartidoLocal(prev => ({ ...prev, sets: nuevosSets }));
        actualizarSetsLocales(nuevosSets);
        setNumeroSetSeleccionado('');
        alert(`Set ${numeroSetSeleccionado} eliminado correctamente`);
      }
    } catch (e) {
      alert('Error eliminando el set');
      console.error(e);
    } finally {
      setEliminando(false);
    }
  };

  if (!partidoLocal) return <p className="text-center text-gray-600 p-4">Cargando partido...</p>;

  const mapEquipo = (equipoId) => {
    if (!numeroSetSeleccionado) return [];
    
    const setKey = `${numeroSetSeleccionado}`;
    const jugadoresDelSet = jugadoresPorSet[setKey] || {};
    const jugadoresDelEquipo = jugadoresDelSet[equipoId] || [];
    
    return jugadoresDelEquipo.map(jugador => ({
      jugadorId: jugador.jugadorId,
      jugadorPartidoId: jugador.jugadorPartidoId,
      estadisticas: jugador.estadisticas || { throws: 0, hits: 0, outs: 0, catches: 0 }
    }));
  };

  return (
    <ModalLayout onClose={onClose}>
      <EncabezadoEstadisticas onClose={onClose} />

      <div className="space-y-4 px-1 pb-4">
        <SelectorSet
          sets={setsLocales}
          numeroSetSeleccionado={numeroSetSeleccionado}
          setNumeroSetSeleccionado={setNumeroSetSeleccionado}
          onAgregarSet={handleAgregarSet}
          eliminarSet={eliminarSet}
          eliminando={eliminando}
          estadisticasSet={estadisticasSet}
          setGanadorSet={setGanadorSetLocal}
          modalidad={partidoLocal.modalidad}
          onGuardarSet={guardar}
        />

        {!numeroSetSeleccionado && (
          <p className="italic text-gray-500 text-center py-4 bg-gray-100 rounded-md">
            Seleccione un set para empezar la carga de estadísticas, o añada uno nuevo.
          </p>
        )}

        {numeroSetSeleccionado && setsLocales.length > 1 && (
          <button
            onClick={copiarJugadoresDeSetAnterior}
            className="text-sm text-blue-600 underline hover:text-blue-800 transition-colors duration-200 ml-2"
          >
            Copiar jugadores del set anterior
          </button>
        )}
        
        {estadisticasSet && (
          <>
            <EquiposEstadisticas
              equipoLocal={partidoLocal.equipoLocal}
              equipoVisitante={partidoLocal.equipoVisitante}
              estadisticas={{
                local: mapEquipo(partidoLocal.equipoLocal._id),
                visitante: mapEquipo(partidoLocal.equipoVisitante._id)
              }}
              onCambiarEstadistica={cambiarEstadistica}
              onAsignarJugador={(equipo, index, jugadorId) => {
                const equipoId = equipo === 'local'
                  ? partidoLocal.equipoLocal._id
                  : partidoLocal.equipoVisitante._id;
                asignarJugador(index, jugadorId, equipoId);
              }}
              token={token}
            />

            <button
              onClick={guardar}
              disabled={guardando}
              className={`
                mt-6 w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200
                bg-green-600 text-white hover:bg-green-700
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              `}
            >
              {guardando ? 'Guardando...' : 'Guardar Estadísticas del Set'}
            </button>
          </>
        )}
      </div>
    </ModalLayout>
  );
}