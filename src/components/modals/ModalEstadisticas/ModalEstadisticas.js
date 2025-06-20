import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import EncabezadoEstadisticas from './EncabezadoEstadisticas';
import SelectorSet from './SelectorSet';
import EquiposEstadisticas from './EquipoEstadisticas';
import Button from '../../common/FormComponents/Button';
import { useSetSeleccionado } from '../../../hooks/useSetSeleccionado';

export default function ModalEstadisticasCaptura({ partido, partidoId, token, onClose, actualizarSetsLocales, agregarSetAPartido, actualizarSetDePartido, refrescarPartidoSeleccionado }) {
  const [numeroSetSeleccionado, setNumeroSetSeleccionado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [partidoLocal, setPartidoLocal] = useState(partido);

  const setsLocales = partidoLocal?.sets || [];
  const estadisticasSet = useSetSeleccionado(numeroSetSeleccionado, setsLocales);

  useEffect(() => { setPartidoLocal(partido); }, [partido]);

  useEffect(() => {
    if (partidoLocal) actualizarSetsLocales(partidoLocal.sets || []);
  }, [partidoLocal?.sets]);

  // Actualizar local solo el statsJugadoresSet, sin llamar actualizarSetsLocales acá
  const actualizarLocalStats = (statsJugadoresSet) => {
    setPartidoLocal(prev => {
      const nuevos = prev.sets.map(s =>
        s.numeroSet === estadisticasSet.numeroSet
          ? { ...s, statsJugadoresSet }
          : s
      );
      return { ...prev, sets: nuevos };
    });
  };

  const asignarJugador = (equipoKey, index, jugadorId) => {
    if (!estadisticasSet) return;
    const equipoId = equipoKey === 'local'
      ? partidoLocal.equipoLocal._id
      : partidoLocal.equipoVisitante._id;

    const raw = [...(estadisticasSet.statsJugadoresSet || [])];
    const filtrado = raw.filter(s => s.equipo === equipoId);
    const globalIndex = raw.findIndex(
      s => s.equipo === equipoId && filtrado.indexOf(s) === index
    );

    const nuevaEntrada = {
      jugador: jugadorId,
      equipo: equipoId,
      estadisticas: filtrado[index]?.estadisticas || { throws: 0, hits: 0, outs: 0, catches: 0 }
    };

    if (globalIndex !== -1) raw[globalIndex] = nuevaEntrada;
    else raw.push(nuevaEntrada);

    actualizarLocalStats(raw);
  };

  const cambiarEstadistica = (jugadorId, campo, delta) => {
    if (!estadisticasSet) return;
    const raw = estadisticasSet.statsJugadoresSet.map(item => {
      if (item.jugador === jugadorId) {
        const val = item.estadisticas[campo] || 0;
        return { ...item, estadisticas: { ...item.estadisticas, [campo]: Math.max(0, val + delta) } };
      }
      return item;
    });
    actualizarLocalStats(raw);
  };

  const guardar = async () => {
    if (!estadisticasSet) {
      alert('Seleccione un set para guardar');
      return;
    }
    setGuardando(true);
    try {
      console.log('Datos a guardar:', {
        ...estadisticasSet,
        statsJugadoresSet: estadisticasSet.statsJugadoresSet
      });
      // Llamás a actualizar todo el set, enviando toda la info del set actualizada
      await actualizarSetDePartido(partidoId, estadisticasSet.numeroSet, estadisticasSet);

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

  const handleAgregarSet = async () => {
    const numero = setsLocales.length > 0
      ? Math.max(...setsLocales.map(s => s.numeroSet)) + 1
      : 1;
    const setData = {
      numeroSet: numero,
      marcadorLocalSet: 0,
      marcadorVisitanteSet: 0,
      estadoSet: 'en_juego',
      statsJugadoresSet: []
    };
    try {
      const creado = await agregarSetAPartido(partidoId, setData);
      if (creado?.numeroSet) {
        // Solo actualizar estado local aquí, no llamar actualizarSetsLocales
        setPartidoLocal(prev => {
          const nuevos = [...prev.sets, creado];
          return { ...prev, sets: nuevos };
        });
        setNumeroSetSeleccionado(creado.numeroSet.toString());
      }
    } catch (e) {
      console.error('Error agregando set:', e);
    }
  };

  if (!partidoLocal) return <p>Cargando partido...</p>;

  const mapEquipo = (equipoId) =>
    estadisticasSet?.statsJugadoresSet
      .filter(s => s.equipo === equipoId)
      .map(s => ({ jugadorId: s.jugador, estadisticas: s.estadisticas }));

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
            <EquiposEstadisticas
              equipoLocal={partidoLocal.equipoLocal}
              equipoVisitante={partidoLocal.equipoVisitante}
              estadisticas={{
                local: mapEquipo(partidoLocal.equipoLocal._id),
                visitante: mapEquipo(partidoLocal.equipoVisitante._id)
              }}
              onCambiarEstadistica={cambiarEstadistica}
              onAsignarJugador={asignarJugador}
            />
            <Button onClick={guardar} disabled={guardando} variant="success">Guardar</Button>
          </>
        )}
      </ModalLayout>
    );
  }
