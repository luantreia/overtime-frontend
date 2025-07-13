import React from 'react';
import TarjetaJugadorEquipo from '../ModalJugador/tarjetaJugadorEquipo';

export default function SeccionJugadores({
  relaciones = [],
  loading = false,
  setModalJugador,
}) {
  const jugadoresActivos = relaciones.filter(
    (r) => r.estado === 'aceptado' && r.jugador
  );

  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4">Jugadores Asignados</h3>

      {loading ? (
        <p className="text-center">Cargando jugadores...</p>
      ) : jugadoresActivos.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {jugadoresActivos.map((relacion) => (
            <TarjetaJugadorEquipo
              key={relacion._id}
              jugador={relacion.jugador}
              relacion={relacion}
              equipo={relacion.equipo}
              onClick={() => setModalJugador(relacion)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">Sin jugadores asignados</p>
      )}
    </div>
  );
}
