import React from 'react';
import TarjetaJugadorEquipo from '../ModalJugador/tarjetaJugadorEquipo';
import { useAuth } from '../../../context/AuthContext';

export default function SeccionJugadores({
  equipoId,
  setModalJugador,
  abrirAsignarJugadores,
  jugadoresVersion,
  relaciones,
  loading,
}) {
  const { user, rol } = useAuth();
  const uid = user?.uid;

  const equipo = relaciones[0]?.equipo;
  const esAdminDelEquipo = equipo?.administradores?.includes(uid);
  const esAdminGlobal = rol === 'admin';

  const puedeAsignar = esAdminGlobal || esAdminDelEquipo || relaciones.length === 0;

  const baseButtonClasses = 'px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out';
  const primaryButtonClasses =
    'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';

  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold">Jugadores Asignados</h3>
        {puedeAsignar && (
          <button onClick={abrirAsignarJugadores} className={`${baseButtonClasses} ${primaryButtonClasses} text-sm`}>
            + Asignar jugadores
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center">Cargando jugadores...</p>
      ) : relaciones.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {relaciones.map((relacion) => {
            const jugador = relacion.jugador;
            if (!jugador) return null;

            return (
              <TarjetaJugadorEquipo
                key={relacion._id}
                jugador={jugador}
                relacion={relacion}
                onClick={() => setModalJugador(relacion)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-600">Sin jugadores asignados</p>
      )}
    </div>
  );
}
