import React, { useState, useEffect } from 'react';
import ModalLayout from '../../common/ModalLayout';
import EncabezadoEquipo from './EncabezadoEquipo';
import SeccionResultados from './SeccionResultados';
import SeccionEstadisticas from './SeccionEstadisticas';
import SeccionJugadores from './SeccionJugadores';
import CloseButton from '../../ui/FormComponents/CloseButton';
import ModalJugadorEquipo from '../ModalJugador/ModalJugadorEquipo';

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
            <CloseButton
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 text-2xl sm:text-3xl ml-4"
            />
          </div>

          {/* Layout responsive: columnas en desktop, filas en móvil */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="order-1">
              <SeccionResultados resultados={partidosDelEquipo} />
            </div>
            <div className="order-3 lg:order-2">
              <SeccionEstadisticas equipoId={equipo._id} />
            </div>
            <div className="order-2 lg:order-3 xl:col-span-1 lg:col-span-2 xl:col-span-1">
              <SeccionJugadores
                equipoId={equipo._id}
                setModalJugador={setModalJugador}
                jugadoresVersion={jugadoresVersion}
                relaciones={relaciones}
                loading={loadingRelaciones}
              />
            </div>
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
