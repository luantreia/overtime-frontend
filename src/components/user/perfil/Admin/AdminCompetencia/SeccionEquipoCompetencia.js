import React, { useEffect, useState } from 'react';
import ModalEquipoCompetenciaAdmin from './AdminEquipoCompetencia/ModalEquipoCompetenciaAdmin';

const API = 'https://overtime-ddyl.onrender.com/api';

export default function SeccionEquipoCompetencia({ competenciaId, temporadaId, token, usuarioId }) {
  const [participacionesTemporada, setParticipacionesTemporada] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [equipoCompetenciaSeleccionado, setEquipoCompetenciaSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Carga participaciones de temporada (equipos en esa temporada)
  const cargarParticipacionesTemporada = async () => {
    if (!temporadaId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/participacion-temporada?temporada=${temporadaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar participaciones temporada');
      const data = await res.json();
      setParticipacionesTemporada(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarParticipacionesTemporada();
  }, [temporadaId, token]);

  const abrirModal = (participacionTemporada) => {
    setEquipoCompetenciaSeleccionado(participacionTemporada);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEquipoCompetenciaSeleccionado(null);
    cargarParticipacionesTemporada(); // recargar para refrescar cambios
  };

  return (
    <section className="mb-6">
      <h4 className="text-lg font-semibold mb-2">Equipos en la Temporada</h4>

      {loading && <p>Cargando equipos...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && participacionesTemporada.length === 0 && (
        <p className="text-gray-600">No hay equipos asociados a esta temporada.</p>
      )}
      {!loading && participacionesTemporada.length > 0 && (
        <ul className="border rounded max-h-64 overflow-auto divide-y mb-4">
          {participacionesTemporada.map((pt) => (
            <li
              key={pt._id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => abrirModal(pt)}
            >
              <div>
                <strong>{pt.equipo?.nombre}</strong>
                {pt.estado && (
                  <span className="ml-2 text-sm text-gray-600">({pt.estado})</span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  abrirModal(pt);
                }}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}

      {mostrarModal && equipoCompetenciaSeleccionado && (
        <ModalEquipoCompetenciaAdmin
          competenciaId={competenciaId}
          abierto={mostrarModal}
          onClose={cerrarModal}
          participacionTemporada={equipoCompetenciaSeleccionado}
          token={token}
          usuarioId={usuarioId}
        />
      )}
    </section>
  );
}
