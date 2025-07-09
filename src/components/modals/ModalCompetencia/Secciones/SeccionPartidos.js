import React, { useState } from 'react';
import { usePartidos } from '../../../../hooks/usePartidos';
import TarjetaPartido from './../../ModalPartido/TarjetaPartido'; // Ajustá la ruta si está en otra carpeta
import ModalPartido from './../../ModalPartido/Modalpartido'; // Importá tu modal
import { useAuth } from '../../../../context/AuthContext';

export default function SeccionPartidos({ competenciaId, faseId = null }) {
  const { token } = useAuth();
  const {
    partidos,
    loading,
    error,
    cargarPartidoPorId,
    eliminarSetDePartido,
    agregarSetAPartido,
    editarPartidoExistente,
    actualizarSetDePartido,
  } = usePartidos(token);

  const [partidoSeleccionado, setPartidoSeleccionado] = useState(null);

  const refrescarPartidoSeleccionado = async () => {
    if (partidoSeleccionado?._id) {
      const actualizado = await cargarPartidoPorId(partidoSeleccionado._id);
      if (actualizado) {
        setPartidoSeleccionado(actualizado);
      }
    }
  };

  const partidosFiltrados = partidos
    .filter(p => {
      const coincideCompetencia = p.competencia?._id === competenciaId || p.competencia === competenciaId;
      const coincideFase = faseId ? p.fase === faseId || p.fase?._id === faseId : true;
      return coincideCompetencia && coincideFase;
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (loading) return <p className="text-gray-600">Cargando partidos...</p>;
  if (error) return <p className="text-red-600">Error al cargar partidos: {error}</p>;
  if (partidosFiltrados.length === 0) return <p className="text-gray-500">No hay partidos registrados aún.</p>;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Partidos</h3>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {partidosFiltrados.map(partido => (
          <TarjetaPartido
            key={partido._id}
            partido={partido}
            onClick={() => setPartidoSeleccionado(partido)}
          />
        ))}
      </div>

      {partidoSeleccionado && (
        <ModalPartido
          partido={partidoSeleccionado}
          token={token}
          refrescarPartidoSeleccionado={refrescarPartidoSeleccionado}
          onClose={() => setPartidoSeleccionado(null)}
          agregarSetAPartido={agregarSetAPartido}
          eliminarSetDePartido={eliminarSetDePartido}
          cargarPartidoPorId={cargarPartidoPorId}
          editarPartidoExistente={editarPartidoExistente}
          actualizarSetDePartido={actualizarSetDePartido}
        />
      )}
    </div>
  );
}