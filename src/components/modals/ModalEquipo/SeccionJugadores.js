import React from 'react';
import TarjetaJugador from '../ModalJugador/tarjetajugador';
import { useJugadorEquipo } from '../../../hooks/useJugadoresEquipo';
import { useAuth } from '../../../context/AuthContext';
// import Button from '../../common/FormComponents/Button'; // REMOVIDO: Ya no usamos el componente Button externo

export default function SeccionJugadores({ equipoId, setModalJugador, abrirAsignarJugadores, jugadoresVersion }) {
  // Nota: se añadió 'jugadoresVersion' a los props para que el useEffect en useJugadorEquipo
  // pueda re-ejecutarse si lo necesita, aunque no se usa directamente en el renderizado aquí.
  const { relaciones, loading } = useJugadorEquipo({ equipoId }); // Asumo que este hook podría depender de jugadoresVersion
  const { user, rol } = useAuth();
  const uid = user?.uid;

  const equipo = relaciones[0]?.equipo;
  const esAdminDelEquipo = equipo?.administradores?.includes(uid);
  const esAdminGlobal = rol === 'admin';

  // Siempre mostrar el botón si es admin global, o si ya hay relaciones para chequear permisos
  const puedeAsignar = esAdminGlobal || esAdminDelEquipo || relaciones.length === 0;

  // Clases comunes para el botón, si decides usar esta misma lógica aquí
  const baseButtonClasses = "px-4 py-2 rounded-lg font-semibold transition duration-200 ease-in-out";
  const primaryButtonClasses = "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";

  return (
    // Se agregan clases de ancho responsivo al div principal de la sección.
    // w-full: ocupa todo el ancho en pantallas pequeñas
    // md:w-[calc(50%-10px)]: ocupa casi la mitad en pantallas medianas (para 2 columnas)
    // lg:w-[calc(33.33%-10px)]: ocupa casi un tercio en pantallas grandes (para 3 columnas)
    // El '-10px' compensa el gap de 20px (gap-5) aplicado en el contenedor padre flex.
    <div className="w-full bg-gray-100 p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4"> {/* Encabezado migrado */}
        <h3 className="text-xl font-bold">Jugadores Asignados</h3>
        {puedeAsignar && (
          <button
            onClick={abrirAsignarJugadores}
            className={`${baseButtonClasses} ${primaryButtonClasses} text-sm`} // Clases de Tailwind para el botón
          >
            + Asignar jugadores
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center">Cargando jugadores...</p>
      ) : relaciones.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-center"> {/* jugadoresGrid migrado */}
          {relaciones.map((rel) => {
            const jugador = rel.jugador;
            if (!jugador) return null;

            return (
              <TarjetaJugador
                key={jugador._id}
                jugador={jugador}
                nombre={jugador.nombre}
                equipo={rel.equipo?.nombre}
                posicion={jugador.posicion}
                foto={jugador.foto}
                onClick={() => setModalJugador(jugador)}
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

// El objeto 'styles' se elimina completamente
// const styles = { ... };