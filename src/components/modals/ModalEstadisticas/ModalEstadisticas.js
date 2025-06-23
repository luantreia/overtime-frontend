// src/components/modals/ModalEstadisticasCaptura/index.js
import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import EncabezadoEstadisticas from './EncabezadoEstadisticas';
import SelectorSet from './SelectorSet';
import EquiposEstadisticas from './EquipoEstadisticas';
import SelectorGanadorSet from './SelectorGanadorSet';
import Button from '../../common/FormComponents/Button';
import { useSetSeleccionado } from '../../../hooks/useSetSeleccionado';

export default function ModalEstadisticasCaptura({
  partido,
  partidoId,
  token,
  onClose,
  actualizarSetsLocales,
  agregarSetAPartido,
  actualizarSetDePartido,
  refrescarPartidoSeleccionado
}) {
  const [numeroSetSeleccionado, setNumeroSetSeleccionado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [partidoLocal, setPartidoLocal] = useState(partido);

  const setsLocales = partidoLocal?.sets || [];
  const estadisticasSet = useSetSeleccionado(numeroSetSeleccionado, setsLocales);

  // Sincroniza partidoLocal con los props al cambiar
  useEffect(() => {
    setPartidoLocal(partido);
  }, [partido]);

  // Setea el primer set automáticamente si no hay ninguno seleccionado
  useEffect(() => {
    if (setsLocales.length > 0 && !numeroSetSeleccionado) {
      setNumeroSetSeleccionado(setsLocales[0].numeroSet.toString());
    }
  }, [setsLocales, numeroSetSeleccionado]);

  // Notifica al padre los cambios locales en los sets
  useEffect(() => {
    if (partidoLocal) actualizarSetsLocales(partidoLocal.sets || []);
  }, [partidoLocal?.sets]);

  // Modifica el set seleccionado dentro del estado local del partido
  const actualizarSetSeleccionado = (cambios) => {
    if (!estadisticasSet) return;
    setPartidoLocal(prev => {
      const nuevosSets = prev.sets.map(s =>
        s.numeroSet === estadisticasSet.numeroSet ? { ...s, ...cambios } : s
      );
      return { ...prev, sets: nuevosSets };
    });
  };

  // Asigna un nuevo jugador a un equipo en el set actual
  const asignarJugador = (indexLocal, jugadorId, equipoId) => {
    const actual = estadisticasSet.statsJugadoresSet || [];

    // Buscar duplicados: mismo jugador ya asignado al mismo equipo
    const duplicado = actual.some((s, i) => {
      const id = typeof s.jugador === 'object' ? s.jugador._id : s.jugador;
      return id === jugadorId && String(s.equipo) === String(equipoId) && i !== indexLocal;
    });
    if (duplicado) return;

    // Filtrar solo los del equipo actual
    const statsDelEquipo = actual.filter(s => String(s.equipo) === String(equipoId));

    // Si aún no hay suficientes en el equipo, agregamos
    if (statsDelEquipo.length <= indexLocal) {
      const nuevosStats = [...actual, {
        jugador: jugadorId,
        equipo: equipoId,
        estadisticas: { throws: 0, hits: 0, outs: 0, catches: 0 }
      }];
      actualizarSetSeleccionado({ statsJugadoresSet: nuevosStats });
      return;
    }

    // Si ya existe, actualizamos esa posición del equipo dentro del array global
    const jugadorGlobalIndex = actual.findIndex((s, idx) => {
      const mismoEquipo = String(s.equipo) === String(equipoId);
      const esElIndexDelEquipo = actual
        .filter(x => String(x.equipo) === String(equipoId))
        .indexOf(s) === indexLocal;
      return mismoEquipo && esElIndexDelEquipo;
    });

    if (jugadorGlobalIndex === -1) return;

    const nuevosStats = [...actual];
    nuevosStats[jugadorGlobalIndex] = {
      jugador: jugadorId,
      equipo: equipoId,
      estadisticas: nuevosStats[jugadorGlobalIndex]?.estadisticas || { throws: 0, hits: 0, outs: 0, catches: 0 }
    };

    actualizarSetSeleccionado({ statsJugadoresSet: nuevosStats });
  };

  // Incrementa o decrementa una estadística para un jugador
  const cambiarEstadistica = (jugadorId, campo, delta) => {
    if (!estadisticasSet) return;
    const nuevosStats = estadisticasSet.statsJugadoresSet.map(item => {
      const id = typeof item.jugador === 'object' ? item.jugador._id : item.jugador;
      if (id === jugadorId) {
        const val = item.estadisticas[campo] || 0;
        return {
          ...item,
          estadisticas: {
            ...item.estadisticas,
            [campo]: Math.max(0, val + delta)
          }
        };
      }
      return item;
    });
    actualizarSetSeleccionado({ statsJugadoresSet: nuevosStats });
  };

  // Define el ganador del set (solo en estado local)
  const setGanadorSetLocal = (ganador) => {
    actualizarSetSeleccionado({ ganadorSet: ganador });
  };

  // Guarda todos los datos del set actual en el backend
  const guardar = async () => {
    if (!estadisticasSet) return alert('Seleccione un set para guardar');
    setGuardando(true);
    try {
      await actualizarSetDePartido(partidoId, estadisticasSet.numeroSet, {
        ganadorSet: estadisticasSet.ganadorSet || 'pendiente',
        estadoSet: 'finalizado',
        statsJugadoresSet: estadisticasSet.statsJugadoresSet
      });
      const refreshed = await refrescarPartidoSeleccionado(partidoId);
      setPartidoLocal(refreshed);
      alert('Estadísticas guardadas correctamente');
      onClose();
    } catch (e) {
      console.error('Error guardando estadísticas:', e);
      alert('Error al guardar estadísticas');
    } finally {
      setGuardando(false);
    }
  };

  // Agrega un nuevo set al partido
  const handleAgregarSet = async () => {
    const numero = setsLocales.length > 0
      ? Math.max(...setsLocales.map(s => s.numeroSet)) + 1
      : 1;
    const setData = {
      numeroSet: numero,
      ganadorSet: 'pendiente',
      estadoSet: 'en_juego',
      statsJugadoresSet: []
    };
    try {
      const creado = await agregarSetAPartido(partidoId, setData);
      if (creado?.numeroSet) {
        setPartidoLocal(prev => ({ ...prev, sets: [...prev.sets, creado] }));
        setNumeroSetSeleccionado(creado.numeroSet.toString());
      }
    } catch (e) {
      console.error('Error agregando set:', e);
    }
  };

  if (!partidoLocal) return <p>Cargando partido...</p>;

  // Prepara las estadísticas por equipo para pasarlas al componente de edición
  const mapEquipo = (equipoId) =>
    estadisticasSet?.statsJugadoresSet
      .filter(s => String(s.equipo) === String(equipoId))
      .map(s => ({
        jugadorId: typeof s.jugador === 'object' ? s.jugador._id : s.jugador,
        estadisticas: s.estadisticas
      }));

  return (
    <ModalLayout onClose={onClose}>
      <EncabezadoEstadisticas onAgregarSet={handleAgregarSet} onClose={onClose} />

      <SelectorSet
        sets={setsLocales}
        numeroSetSeleccionado={numeroSetSeleccionado}
        setNumeroSetSeleccionado={setNumeroSetSeleccionado}
      />

      {!numeroSetSeleccionado && <p style={{ fontStyle: 'italic', color: '#555' }}>Seleccione un set...</p>}

      {estadisticasSet && (
        <>
          <SelectorGanadorSet
            ganadorSet={estadisticasSet.ganadorSet || 'pendiente'}
            setGanadorSet={setGanadorSetLocal}
            modalidad={partidoLocal.modalidad}
          />

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
          />

          <Button onClick={guardar} disabled={guardando} variant="success">
            Guardar
          </Button>
        </>
      )}
    </ModalLayout>
  );
}