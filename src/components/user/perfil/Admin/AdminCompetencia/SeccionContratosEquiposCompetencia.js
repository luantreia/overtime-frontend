import React, { useEffect, useState } from 'react';
import ModalEquipoCompetenciaAdmin from './AdminEquipoCompetencia/ModalEquipoCompetenciaAdmin';

const API = 'https://overtime-ddyl.onrender.com/api';

export default function SeccionContratosEquiposCompetencia({ competenciaId, token, usuarioId }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (competenciaId && token) {
      cargarEquiposCompetencia();
    }
  }, [competenciaId, token]);

  const cargarEquiposCompetencia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/equipos-competencia?competencia=${competenciaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar equipos');
      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (equipo) => {
    setEquipoSeleccionado(equipo);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEquipoSeleccionado(null);
  };

  const renderEquipoItem = (ec) => (
    <li
      key={ec._id}
      className="p-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => abrirModal(ec)}
    >
      <strong>{ec.equipo?.nombre}</strong>
      {ec.nombreAlternativo && (
        <span className="ml-2 text-sm text-gray-600">(alias: {ec.nombreAlternativo})</span>
      )}
    </li>
  );

  return (
    <section className="mb-6">
      <h4 className="text-lg font-semibold mb-2">Equipos en la Competencia</h4>

      {loading && <p>Cargando equipos...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && equipos.length === 0 && (
        <p className="text-gray-600">No hay equipos asociados a esta competencia.</p>
      )}
      {!loading && equipos.length > 0 && (
        <ul className="border rounded max-h-64 overflow-auto divide-y mb-4">
          {equipos.map(renderEquipoItem)}
        </ul>
      )}

      {mostrarModal && equipoSeleccionado && (
        <ModalEquipoCompetenciaAdmin
          competenciaId={competenciaId}
          abierto={mostrarModal}
          onClose={cerrarModal}
          equipoCompetencia={equipoSeleccionado}
          token={token}
          usuarioId={usuarioId}
          onUpdate={cargarEquiposCompetencia}
        />
      )}
    </section>
  );
}
