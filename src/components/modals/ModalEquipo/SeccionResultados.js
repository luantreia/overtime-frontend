// components/modals/ModalEquipo/SeccionResultados.js
import React, { useState } from 'react';
import TarjetaPartido from '../ModalPartido/TarjetaPartido'; // Ajustá el path si cambia
import ModalPartido from '../ModalPartido/Modalpartido';    // Ajustá el path si cambia
import { useAuth } from '../../../context/AuthContext';

const PARTIDOS_POR_PAGINA = 4;

export default function SeccionResultados({ resultados = [] }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);
  const { token } = useAuth();

  const totalPaginas = Math.ceil(resultados.length / PARTIDOS_POR_PAGINA);

  const partidosPagina = resultados.slice(
    (paginaActual - 1) * PARTIDOS_POR_PAGINA,
    paginaActual * PARTIDOS_POR_PAGINA
  );

  return (
    <div className="w-full lg:w-[calc(60%-10px)] bg-gray-100 p-4 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4">Últimos Partidos</h3>

      {resultados.length === 0 ? (
        <p className="text-gray-600">Sin datos</p>
      ) : (
        <div className="space-y-2">
          <div className="lista px-0">
          {partidosPagina.map((partido) => (
            <TarjetaPartido
              key={partido._id}
              partido={partido}
              onClick={() => setPartidoSeleccionado(partido)}
            />
          ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2 flex-wrap">
              <button
                onClick={() => setPaginaActual(p => p - 1)}
                disabled={paginaActual === 1}
                className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPaginaActual(num)}
                  className={`px-3 py-1 rounded border ${
                    num === paginaActual
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white hover:bg-blue-100'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setPaginaActual(p => p + 1)}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de partido */}
      {partidoSeleccionado && (
        <ModalPartido
          partido={partidoSeleccionado}
          onClose={() => setPartidoSeleccionado(null)}
          token={token}
          // Otros props según tus necesidades:
          // agregarSetAPartido={...}
          // actualizarSetDePartido={...}
          // eliminarSetDePartido={...}
          // cargarPartidoPorId={...}
        />
      )}
    </div>
  );
}

