import React, { useState, useEffect } from 'react';
import ModalEstadisticasCaptura from '../ModalEstadisticas/ModalEstadisticas';
import PartidoDatosGenerales from './PartidoDatosGenerales';
import Button from '../../common/FormComponents/Button';
import useJugadores from '../../../hooks/useJugadores';
import CloseButton from '../../common/FormComponents/CloseButton';
import ExportarExcelBoton from '../../common/FormComponents/ExportarExcelboton';
import PartidoSetsLineaDeTiempo from './PartidoSetsLineaDeTiempo';
import PartidoDatosGeneralesEditable from './PartidoDatosGeneralesEditable';

export default function ModalPartido({
  partido,
  onClose,
  token,
  refrescarPartidoSeleccionado,
  eliminarSetDePartido,
  cargarPartidoPorId,
  agregarSetAPartido,
  editarPartidoExistente,
  actualizarSetDePartido,
}) {
  const [modalEstadisticasAbierto, setModalEstadisticasAbierto] = useState(false);
  const [setsLocales, setSetsLocales] = useState(partido.sets || []);
  const { jugadores } = useJugadores(token); // Ensure useJugadores is defined and used correctly
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    setSetsLocales(partido.sets || []);
  }, [partido]);

  if (!partido) return null;

  // This function is defined but not used in the provided JSX.
  // Consider removing if not needed or add logic to use it.
  // const eliminarSetLocal = (numeroSet) => {
  //   setSetsLocales(prevSets => prevSets.filter(s => s.numeroSet !== numeroSet));
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] p-4"> {/* Overlay */}
      <div className="bg-white rounded-lg p-6 md:p-8 w-full max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl"> {/* Modal Content */}
        <CloseButton onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 text-3xl" /> {/* Adjusted CloseButton position and size */}

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Detalles del Partido</h2> {/* Title styling */}

        <div className="space-y-6 mb-6"> {/* Container for main partido details */}
          {modoEdicion ? (
            <PartidoDatosGeneralesEditable
              datosIniciales={partido}
              onGuardar={async (datosActualizados) => {
                const payload = {
                  ...datosActualizados,
                  fecha: datosActualizados.fecha ? new Date(datosActualizados.fecha) : null,
                };
                await editarPartidoExistente(partido._id, payload);
                await refrescarPartidoSeleccionado(); // para recargar desde backend si querés
                setModoEdicion(false);
              }}
              onCancelar={() => setModoEdicion(false)}
            />
          ) : (
            <PartidoDatosGenerales partido={partido} />
          )}
          <button
            onClick={() => setModoEdicion(prev => !prev)}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {modoEdicion ? 'Cancelar edición' : 'Editar Datos'}
          </button>
          <PartidoSetsLineaDeTiempo
            sets={partido.sets}
            equipoLocal={partido.equipoLocal}
            equipoVisitante={partido.equipoVisitante}
          />
        </div>

        <div className="flex flex-col md:flex-row md:justify-end md:gap-4 space-y-3 md:space-y-0 mt-6 pt-4 border-t"> {/* Buttons container */}
          <button onClick={() => setModalEstadisticasAbierto(true)}
                  className=" px-4 py-2 bg-blue-600 text-white font-medium rounded-md
                 hover:bg-blue-700 transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
            Cargar estadísticas
          </button>
          <ExportarExcelBoton partido={partido} className=" md:w-auto" />
        </div>

        {modalEstadisticasAbierto && (
          <ModalEstadisticasCaptura
            partido={partido}
            setsLocales={setsLocales}
            partidoId={partido._id}
            token={token}
            onClose={() => setModalEstadisticasAbierto(false)}
            agregarSetAPartido={agregarSetAPartido}
            eliminarSetDePartido={eliminarSetDePartido}
            cargarPartidoPorId={cargarPartidoPorId}
            actualizarSetsLocales={setSetsLocales}
            actualizarSetDePartido={actualizarSetDePartido}
            refrescarPartidoSeleccionado={refrescarPartidoSeleccionado}
          />
        )}
      </div>
    </div>
  );
}