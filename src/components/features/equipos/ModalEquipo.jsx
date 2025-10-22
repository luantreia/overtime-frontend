import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import EncabezadoEquipo from './components/EncabezadoEquipo';
import ModalJugadorEquipo from '../jugadores/ModalJugadorEquipo';
import { Button } from '../../ui';

import { usePartidosDeEquipo } from '../../../hooks/equipos/usePartidosDeEquipo';
import { useAuth } from '../../../context/AuthContext';

function ModalEquipo({ equipo: equipoProp, onClose }) {
  const [equipo, setEquipo] = useState(equipoProp);
  const [relaciones, setRelaciones] = useState([]);
  const [loadingRelaciones, setLoadingRelaciones] = useState(true);
  const [modalJugador, setModalJugador] = useState(null);
  const [jugadoresVersion, setJugadoresVersion] = useState(0);

  const { token } = useAuth();
  const { partidos: partidosDelEquipo } = usePartidosDeEquipo(equipo?._id);

  const colorPrimario = equipo?.colores?.[0] || '#1e3a8a';
  const colorSecundario = equipo?.colores?.[1] || '#ffffff';

  useEffect(() => {
    setEquipo(equipoProp);
  }, [equipoProp]);

  useEffect(() => {
    async function cargarRelaciones() {
      if (!equipo?._id || !token) return;

      try {
        setLoadingRelaciones(true);
        const res = await fetch(`https://overtime-ddyl.onrender.com/api/jugador-equipo?equipo=${equipo._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al obtener relaciones jugador-equipo');
        const data = await res.json();
        setRelaciones(data);
      } catch (err) {
        console.error('Error al obtener relaciones jugador-equipo:', err);
        setRelaciones([]);
      } finally {
        setLoadingRelaciones(false);
      }
    }

    cargarRelaciones();
  }, [equipo?._id, token, jugadoresVersion]);

  if (!equipo) return null;

  return (
    <>
      <ModalLayout onClose={onClose} maxWidth="max-w-6xl">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between border-b pb-3 mb-4 sm:mb-6">
            <div className="flex-1">
              <EncabezadoEquipo equipo={equipo} />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              ✕
            </Button>
          </div>

          {/* Información básica del equipo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Información General
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">País:</span>
                    <span className="font-medium">{equipo.pais || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                    <span className="font-medium">
                      {equipo.estaActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Jugadores:</span>
                    <span className="font-medium">{relaciones.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Partidos Recientes
                </h3>
                {partidosDelEquipo?.length > 0 ? (
                  <div className="space-y-2">
                    {partidosDelEquipo.slice(0, 3).map((partido, index) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          vs {partido.equipoLocal?._id === equipo._id
                            ? partido.equipoVisitante?.nombre
                            : partido.equipoLocal?.nombre}
                        </span>
                        <span className="font-medium">
                          {partido.marcadorLocal} - {partido.marcadorVisitante}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay partidos registrados
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lista de jugadores */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Jugadores ({relaciones.length})
            </h3>
            {loadingRelaciones ? (
              <p className="text-gray-500 dark:text-gray-400">Cargando jugadores...</p>
            ) : relaciones.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relaciones.map((relacion, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setModalJugador(relacion)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {relacion.jugador?.nombre || 'Jugador'} {relacion.jugador?.apellido || ''}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {relacion.posicion || 'Sin posición'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No hay jugadores registrados
              </p>
            )}
          </div>
        </div>
      </ModalLayout>

      {modalJugador && (
        <ModalJugadorEquipo
          relacion={modalJugador}
          onClose={() => setModalJugador(null)}
          onJugadorActualizado={() => {
            setModalJugador(null);
            setJugadoresVersion((v) => v + 1);
          }}
        />
      )}
    </>
  );
}

export default ModalEquipo;
