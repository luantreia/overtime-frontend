import { useEffect } from 'react';
import { agregarJugadorPartido } from '../../services/jugadorPartidoService';

/**
 * Hook personalizado para manejar la lógica de asignación de jugadores
 */
export const useAsignacionJugadores = (
  mostrarAsignacion,
  jugadores,
  partido,
  jugadoresSeleccionadosLocal,
  jugadoresSeleccionadosVisitante,
  setJugadoresSeleccionadosLocal,
  setJugadoresSeleccionadosVisitante,
  setAsignandoJugadores,
  token,
  onCargarDatos
) => {

  // Efecto para inicializar la selección de jugadores cuando se muestra la asignación
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

  // Función para alternar la selección de un jugador del equipo local
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

  // Función para alternar la selección de un jugador del equipo visitante
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

  // Función para asignar los jugadores seleccionados al partido
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

      // Agregar jugadores nuevos al equipo local
      for (const jugadorId of jugadoresSeleccionadosLocal) {
        if (!jugadoresActualesLocal.has(jugadorId)) {
          promises.push(
            agregarJugadorPartido({
              partido: partido._id,
              jugador: jugadorId,
              equipo: partido.equipoLocal._id,
              creadoPor: 'usuario'
            }, token)
          );
        }
      }

      // Agregar jugadores nuevos al equipo visitante
      for (const jugadorId of jugadoresSeleccionadosVisitante) {
        if (!jugadoresActualesVisitante.has(jugadorId)) {
          promises.push(
            agregarJugadorPartido({
              partido: partido._id,
              jugador: jugadorId,
              equipo: partido.equipoVisitante._id,
              creadoPor: 'usuario'
            }, token)
          );
        }
      }

      // Remover jugadores que ya no están seleccionados
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

      // Recargar datos después de la asignación
      await onCargarDatos();

    } catch (error) {
      console.error('Error asignando jugadores:', error);
      alert('Error al actualizar asignación: ' + error.message);
    } finally {
      setAsignandoJugadores(false);
    }
  };

  const hayJugadoresAsignados = jugadores.length > 0;

  return {
    toggleJugadorLocal,
    toggleJugadorVisitante,
    asignarJugadores,
    hayJugadoresAsignados
  };
};
