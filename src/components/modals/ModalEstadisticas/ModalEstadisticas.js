import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import EncabezadoEstadisticas from './EncabezadoEstadisticas';
import SelectorSet from './SelectorSet'; 
import EquiposEstadisticas from './EquipoEstadisticas';
import { useSetSeleccionado } from '../../../hooks/useSetSeleccionado';

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

  const setsLocales = partidoLocal?.sets || [];
  const estadisticasSet = useSetSeleccionado(numeroSetSeleccionado, setsLocales);

  useEffect(() => {
    setPartidoLocal(partido);
  }, [partido]);

  useEffect(() => {
    if (setsLocales.length > 0 && !numeroSetSeleccionado) {
      setNumeroSetSeleccionado(setsLocales[0].numeroSet.toString());
    }
  }, [setsLocales, numeroSetSeleccionado]);

  useEffect(() => {
    if (partidoLocal) actualizarSetsLocales(partidoLocal.sets || []);
  }, [partidoLocal?.sets]);

  const actualizarSetSeleccionado = (cambios) => {
    if (!estadisticasSet) return;
    setPartidoLocal(prev => {
      const nuevosSets = prev.sets.map(s =>
        s.numeroSet === estadisticasSet.numeroSet ? { ...s, ...cambios } : s
      );
      return { ...prev, sets: nuevosSets };
    });
  };

  const asignarJugador = (indexLocal, jugadorId, equipoId) => {
    const actual = estadisticasSet.statsJugadoresSet || [];

    const duplicado = actual.some((s, i) => {
      const id = typeof s.jugador === 'object' ? s.jugador._id : s.jugador;
      return id === jugadorId && String(s.equipo) === String(equipoId) && i !== indexLocal;
    });
    if (duplicado) return;

    const statsDelEquipo = actual.filter(s => String(s.equipo) === String(equipoId));

    if (statsDelEquipo.length <= indexLocal) {
      const nuevosStats = [...actual, {
        jugador: jugadorId,
        equipo: equipoId,
        estadisticas: { throws: 0, hits: 0, outs: 0, catches: 0 }
      }];
      actualizarSetSeleccionado({ statsJugadoresSet: nuevosStats });
      return;
    }

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

  const setGanadorSetLocal = (ganador) => {
    actualizarSetSeleccionado({ ganadorSet: ganador });
  };

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
    } catch (e) {
      console.error('Error guardando estadísticas:', e);
      alert('Error al guardar estadísticas');
    } finally {
      setGuardando(false);
    }
  };

  const copiarJugadoresDeSetAnterior = () => {
    if (!estadisticasSet) return;

    const actual = estadisticasSet.numeroSet;
    const anterior = setsLocales
      .filter(set => set.numeroSet < actual)
      .sort((a, b) => b.numeroSet - a.numeroSet)[0];

    if (!anterior || !anterior.statsJugadoresSet?.length) {
      alert('No hay jugadores en el set anterior para copiar.');
      return;
    }

    const jugadoresCopiados = anterior.statsJugadoresSet.map(j => ({
      jugador: typeof j.jugador === 'object' ? j.jugador._id : j.jugador,
      equipo: j.equipo,
      estadisticas: {
        throws: 0,
        hits: 0,
        outs: 0,
        catches: 0
      }
    }));

    actualizarSetSeleccionado({ statsJugadoresSet: jugadoresCopiados });
  };

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

  const mapEquipo = (equipoId) =>
    estadisticasSet?.statsJugadoresSet
      .filter(s => String(s.equipo) === String(equipoId))
      .map(s => ({
        jugadorId: typeof s.jugador === 'object' ? s.jugador._id : s.jugador,
        estadisticas: s.estadisticas
      }));

  return (
    <ModalLayout onClose={onClose}>
      <EncabezadoEstadisticas onClose={onClose} /> {/* No longer passes onAgregarSet */}

      <div className="space-y-4 px-1 pb-4">
        <SelectorSet
          sets={setsLocales}
          numeroSetSeleccionado={numeroSetSeleccionado}
          setNumeroSetSeleccionado={setNumeroSetSeleccionado}
          onAgregarSet={handleAgregarSet}
          eliminarSet={eliminarSet}
          eliminando={eliminando}
          // PROPS FOR WINNER SELECTION:
          estadisticasSet={estadisticasSet}
          setGanadorSet={setGanadorSetLocal}
          modalidad={partidoLocal.modalidad}
          onGuardarSet={guardar}
        />

        {/* This block is now handled within SelectorSet.js, so it's removed */}
        {/* {numeroSetSeleccionado && ( ... )} */}

        {/* The 'Seleccione un set...' message might need adjustment if SelectorSet always shows something.
            Keeping it for now as a fallback if no sets exist or nothing is selected. */}
        {!numeroSetSeleccionado && (
          <p className="italic text-gray-500 text-center py-4 bg-gray-100 rounded-md">
            Seleccione un set para empezar la carga de estadísticas, o añada uno nuevo.
          </p>
        )}

        {/* SelectorGanadorSet is now inside SelectorSet, so it's removed here */}
        {/* {estadisticasSet && ( <SelectorGanadorSet ... /> )} */}
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