import React, { useState } from 'react';
import EditarJugador from './EditarJugador';
import useUserRole from '../../../hooks/useUserRole'; // This hook doesn't seem to be used, consider removing if not needed.
import CloseButton from '../../common/FormComponents/CloseButton';
import Button from '../../common/FormComponents/Button';
import SeccionEquiposJugador from './SeccionEquiposJugador';
import SeccionEstadisticasJugador from './SeccionEstadisticasJugador'; // This component is imported but not used, consider removing if not needed.
import { useAuth } from '../../../context/AuthContext';
import RadarPromedios from './RadarPromedios';
import useResumenEstadisticasJugador from '../../../hooks/useResumenEstadisticasJugador';

export default function ModalJugador({ jugador, onClose, onJugadorActualizado }) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarPromedios, setMostrarPromedios] = useState(false);
  const { token } = useAuth();
  const { uid } = useUserRole(); // This variable is not used
  const { resumen, loading: loadingResumen } = useResumenEstadisticasJugador(jugador._id, token);

  const calcularEdad = fechaNacimiento => {
    if (!fechaNacimiento) return jugador.edad || 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleGuardar = actualizado => {
    setModoEdicion(false);
    onJugadorActualizado(actualizado);
  };

  const handleCerrarSubmodal = () => {
    setModoEdicion(false);
  };

  return (
    <div
      className="fixed inset-0 h-screen flex items-center justify-center z-50 p-2 overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-[--color-fondo] p-5 rounded-2xl max-w-2xl w-auto max-h-[80dvh] overflow-y-auto relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <CloseButton onClick={onClose} />

        <div className="flex flex-col gap-3">
          <div className="flex gap-5 items-start">
            <img
              src={jugador.foto || '/default-player.png'}
              alt={`Foto de ${jugador.nombre}`}
              className="w-48 h-96 rounded-lg object-cover"
            />
            <div className="flex flex-col gap-1">
              <h2 className="mt-0 text-2xl font-bold">{jugador.nombre}</h2>
              <p className="mt-0 text-lg">
                <strong>Edad:</strong> {calcularEdad(jugador.fechaNacimiento)}
              </p>
              <Button
                onClick={() => setModoEdicion(true)}
                variant="primary"
                disabled={modoEdicion}
                className="mt-2"
              >
                ✎ Editar
              </Button>
              {/* Modular Section: Player Teams */}
              <SeccionEquiposJugador jugadorId={jugador._id} />

              {/* Toggle for Player Stats Section */}
              <Button
                variant="secondary"
                onClick={() => setMostrarPromedios(prev => !prev)}
                className="mt-4"
              >
                {mostrarPromedios ? 'Ocultar Estadísticas' : 'Mostrar Estadísticas'}
              </Button>
            </div>
          </div>

          {/* Modular Section: Player Statistics */}
          {mostrarPromedios && (
            <div className="mt-4 p-4 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3">Estadísticas del Jugador</h3>
              {loadingResumen && <p>Cargando promedios...</p>}
              {resumen && <RadarPromedios resumen={resumen} />}
              {/* Here you could include other statistics components, e.g., <TablaEstadisticas />, <GraficoRendimiento /> */}
            </div>
          )}
        </div>

        {modoEdicion && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[1100] flex items-center justify-center p-2"
            onClick={handleCerrarSubmodal}
          >
            <div className="bg-[--color-fondo] p-5 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
              <EditarJugador
                jugador={jugador}
                onGuardar={handleGuardar}
                onCancelar={handleCerrarSubmodal}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}