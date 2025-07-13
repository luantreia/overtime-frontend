import React, { useState, useEffect } from 'react';
import EncabezadoEquipo from './EncabezadoEquipo';
import SeccionResultados from './SeccionResultados';
import SeccionEstadisticas from './SeccionEstadisticas';
import SeccionJugadores from './SeccionJugadores';
import CloseButton from '../../common/FormComponents/CloseButton';
import ModalJugadorEquipo from '../ModalJugador/ModalJugadorEquipo';

import { usePartidosDeEquipo } from '../../../hooks/usePartidosDeEquipo';
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
  }, [equipo?._id, jugadoresVersion, token]);

  if (!equipoProp || !equipoProp._id) return null;

  return (
    <div
      className="fixed inset-0 h-screen flex justify-center items-center z-50 p-2.5 box-border overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto relative shadow-2xl"
        style={{
          background: `linear-gradient(to bottom right, ${colorPrimario}, ${colorSecundario})`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <CloseButton onClick={onClose} />
          <EncabezadoEquipo equipo={equipo} />

          <div className="flex flex-wrap gap-5">
            <SeccionResultados resultados={partidosDelEquipo} />
            <SeccionEstadisticas equipoId={equipo._id} />
            <SeccionJugadores
              equipoId={equipo._id}
              setModalJugador={setModalJugador}
              jugadoresVersion={jugadoresVersion}
              relaciones={relaciones}
              loading={loadingRelaciones}
            />
          </div>
        </div>

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
      </div>
    </div>
  );
}

export default ModalEquipo;
