import React, { useState, useEffect, useCallback } from 'react';
import ModalLayout from '../../common/ModalLayout';
import EncabezadoEstadisticas from './EncabezadoEstadisticas';
import EquiposEstadisticas from './EquipoEstadisticas';
import { SetManager } from './SetManager';
import { useEstadisticasSet } from '../../../hooks/estadisticas/useEstadisticasSet';

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
  const [partidoLocal, setPartidoLocal] = useState(partido);
  const [numeroSetSeleccionado, setNumeroSetSeleccionado] = useState('');

  const setsLocales = partidoLocal?.sets || [];
  const estadisticasSet = setsLocales.find(s => s.numeroSet.toString() === numeroSetSeleccionado);

  const actualizarSetSeleccionado = useCallback((cambios) => {
    if (!estadisticasSet) return;
    setPartidoLocal(prev => {
      if (!prev || !prev.sets) return prev;
      const nuevosSets = prev.sets.map(s =>
        s.numeroSet === estadisticasSet.numeroSet ? { ...s, ...cambios } : s
      );
      return { ...prev, sets: nuevosSets };
    });
  }, [estadisticasSet]);

  // Hook personalizado para manejar la lógica de estadísticas de set
  const {
    serviciosCargados,
    jugadoresPorSet,
    estadisticasIniciales,
    guardar,
    guardando,
    asignarJugador,
    cambiarEstadistica,
    copiarJugadoresDeSetAnterior,
    mostrarConfirmacionManual,
    estadisticasManualesDetectadas,
    setDataPendiente,
    confirmarRecalculo,
    cancelarRecalculo
  } = useEstadisticasSet({
    partidoId,
    numeroSetSeleccionado,
    estadisticasSet,
    setsLocales,
    token,
    actualizarSetSeleccionado,
    refrescarPartidoSeleccionado
  });

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
  }, [partidoLocal?.sets ? partidoLocal.sets.length : 0]);

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

  const eliminarSet = async () => {
    if (!numeroSetSeleccionado) return alert('Seleccione un set para eliminar');

    const ultimoNumeroSet = Math.max(...setsLocales.map(s => s.numeroSet));

    if (Number(numeroSetSeleccionado) !== ultimoNumeroSet) {
      return alert('Solo se puede eliminar el último set.');
    }

    const confirm = window.confirm(`¿Seguro que querés eliminar el Set ${numeroSetSeleccionado}? Esta acción no se puede deshacer.`);
    if (!confirm) return;

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
    }
  };

  const setGanadorSetLocal = (ganador) => {
    actualizarSetSeleccionado({ ganadorSet: ganador });
  };

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

  if (!partidoLocal) return <p className="text-center text-gray-600 p-4">Cargando partido...</p>;
  if (!serviciosCargados) return <p className="text-center text-gray-600 p-4">Cargando servicios...</p>;

  return (
    <ModalLayout onClose={onClose}>
      <EncabezadoEstadisticas onClose={onClose} />

      <div className="space-y-4 px-1 pb-4">
        <SetManager
          setsLocales={setsLocales}
          numeroSetSeleccionado={numeroSetSeleccionado}
          setNumeroSetSeleccionado={setNumeroSetSeleccionado}
          estadisticasSet={estadisticasSet}
          onAgregarSet={handleAgregarSet}
          onEliminarSet={eliminarSet}
          eliminando={false}
          setGanadorSet={setGanadorSetLocal}
          guardar={guardar}
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

        {/* Modal de confirmación para estadísticas manuales */}
        {mostrarConfirmacionManual && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Advertencia: Estadísticas Manuales Detectadas</h3>
              <p className="text-gray-600 mb-4">
                Se encontraron estadísticas manuales para este partido. Guardar estadísticas automáticas
                recalculará todas las estadísticas agregadas del partido.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmarRecalculo}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Continuar y Recalcular
                </button>
                <button
                  onClick={cancelarRecalculo}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalLayout>
  );
}
