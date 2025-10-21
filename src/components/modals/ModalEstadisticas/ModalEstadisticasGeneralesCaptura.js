import React, { useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import { useJugadorEquipo } from '../../../hooks/jugadores/useJugadoresEquipo';
import { ModalHeader, AutocompletadoInfo, AsignacionJugadores, CapturaEstadisticas } from '../../estadisticas';
import { useEstadisticasModal } from '../../../hooks/estadisticas/useEstadisticasModal';
import { useJugadoresSeleccion } from '../../../hooks/estadisticas/useJugadoresSeleccion';
import { useAsignacionJugadores } from '../../../hooks/estadisticas/useAsignacionJugadores';

export default function ModalEstadisticasGeneralesCaptura({
  partido,
  partidoId,
  token,
  onClose,
  onRefresh,
  datosIniciales = [],
  hayDatosAutomaticos = false
}) {
  // Hook principal para lógica de estadísticas
  const estadisticasState = useEstadisticasModal(partidoId, token);

  // Hook para lógica de selección de jugadores
  const {
    getJugadoresPorEquipo,
    cambiarSeleccionJugador: cambiarSeleccionBase
  } = useJugadoresSeleccion(
    estadisticasState.jugadores,
    estadisticasState.seleccionesLocal,
    estadisticasState.seleccionesVisitante
  );

  // Función para cambiar selección de jugador con actualización de estado
  const cambiarSeleccionJugador = (equipo, posicion, jugadorPartidoId) => {
    cambiarSeleccionBase(equipo, posicion, jugadorPartidoId);
    if (equipo === 'local') {
      estadisticasState.setSeleccionesLocal(prev => {
        const nuevas = [...prev];
        nuevas[posicion] = jugadorPartidoId;
        return nuevas;
      });
    } else {
      estadisticasState.setSeleccionesVisitante(prev => {
        const nuevas = [...prev];
        nuevas[posicion] = jugadorPartidoId;
        return nuevas;
      });
    }
  };

  // Hook para lógica de asignación de jugadores
  const {
    toggleJugadorLocal,
    toggleJugadorVisitante,
    asignarJugadores,
    hayJugadoresAsignados
  } = useAsignacionJugadores(
    estadisticasState.mostrarAsignacion,
    estadisticasState.jugadores,
    partido,
    estadisticasState.jugadoresSeleccionadosLocal,
    estadisticasState.jugadoresSeleccionadosVisitante,
    estadisticasState.setJugadoresSeleccionadosLocal,
    estadisticasState.setJugadoresSeleccionadosVisitante,
    estadisticasState.setAsignandoJugadores,
    token,
    () => estadisticasState.cargarJugadoresYEstadisticas(partido, datosIniciales, hayDatosAutomaticos)
  );

  // Hooks para obtener listas de jugadores por equipo
  const { relaciones: jugadoresLocal, loading: loadingLocal } = useJugadorEquipo({
    equipoId: partido?.equipoLocal?._id,
    token
  });
  const { relaciones: jugadoresVisitante, loading: loadingVisitante } = useJugadorEquipo({
    equipoId: partido?.equipoVisitante?._id,
    token
  });

  // Efecto para cargar datos iniciales
  useEffect(() => {
    estadisticasState.cargarJugadoresYEstadisticas(partido, datosIniciales, hayDatosAutomaticos);
  }, [partidoId, token]);

  // Función para guardar y cerrar
  const guardarYCerrar = async () => {
    const success = await estadisticasState.guardarEstadisticas(partido);
    if (success) {
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
      onClose();
    }
  };

  if (estadisticasState.loading) {
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
        <ModalHeader
          tipoAutocompletado={estadisticasState.tipoAutocompletado}
          datosIniciales={datosIniciales}
        />

        <AutocompletadoInfo
          tipoAutocompletado={estadisticasState.tipoAutocompletado}
          datosIniciales={datosIniciales}
        />

        {estadisticasState.mostrarAsignacion ? (
          <AsignacionJugadores
            partido={partido}
            jugadoresLocal={jugadoresLocal}
            jugadoresVisitante={jugadoresVisitante}
            loadingLocal={loadingLocal}
            loadingVisitante={loadingVisitante}
            jugadoresSeleccionadosLocal={estadisticasState.jugadoresSeleccionadosLocal}
            jugadoresSeleccionadosVisitante={estadisticasState.jugadoresSeleccionadosVisitante}
            toggleJugadorLocal={toggleJugadorLocal}
            toggleJugadorVisitante={toggleJugadorVisitante}
            asignarJugadores={asignarJugadores}
            asignandoJugadores={estadisticasState.asignandoJugadores}
            hayJugadoresAsignados={hayJugadoresAsignados}
            onClose={onClose}
          />
        ) : (
          <CapturaEstadisticas
            partido={partido}
            seleccionesLocal={estadisticasState.seleccionesLocal}
            seleccionesVisitante={estadisticasState.seleccionesVisitante}
            estadisticas={estadisticasState.estadisticas}
            getJugadoresPorEquipo={getJugadoresPorEquipo}
            cambiarSeleccionJugador={cambiarSeleccionJugador}
            cambiarEstadistica={estadisticasState.cambiarEstadistica}
            setMostrarAsignacion={estadisticasState.setMostrarAsignacion}
            guardar={guardarYCerrar}
            guardando={estadisticasState.guardando}
            hayDatosAutomaticos={estadisticasState.tipoAutocompletado === 'automatico'}
          />
        )}
      </div>
    </ModalLayout>
  );
}
