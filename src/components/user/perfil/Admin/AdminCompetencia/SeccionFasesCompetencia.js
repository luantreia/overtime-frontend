import React, { useState, useEffect, useCallback } from 'react';
import ModalFaseAdmin from './AdminFases/ModalFaseAdmin';
import DiagramaFases from './AdminFases/DiagramaFases'; // si lo estás usando

export default function SeccionFasesCompetencia({ competenciaId, token }) {
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [faseEditando, setFaseEditando] = useState(null);
  const [modalNuevaFase, setModalNuevaFase] = useState(false);

  const cargarFases = useCallback(async () => {
    if (!competenciaId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://overtime-ddyl.onrender.com/api/fases?competencia=${competenciaId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar fases');
      setFases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [competenciaId, token]);

  useEffect(() => {
    cargarFases();
  }, [cargarFases]);

  const eliminarFase = async (id) => {
    if (!window.confirm('¿Eliminar esta fase? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/fases/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar fase');
      await cargarFases();
    } catch (e) {
      alert(e.message);
    }
  };

  const renderFaseItem = (fase) => (
    <li
      key={fase._id}
      className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">
            {fase.nombre}{' '}
            <span className="text-sm text-gray-500">({fase.tipo})</span>
          </h4>
          <p className="text-sm text-gray-600">
            {fase.fechaInicio && `Inicio: ${new Date(fase.fechaInicio).toLocaleDateString()}`}{' '}
            {fase.fechaFin && `– Fin: ${new Date(fase.fechaFin).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => setFaseEditando(fase)}
            className="text-blue-600 hover:underline text-sm"
          >
            Editar
          </button>
          <button
            onClick={() => eliminarFase(fase._id)}
            className="text-red-600 hover:underline text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">Fases de la Competencia</h3>
        <button
          onClick={() => setModalNuevaFase(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          + Nueva Fase
        </button>
      </div>

      {loading && <p className="text-gray-600">Cargando fases...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && fases.length === 0 && (
        <p className="text-gray-500">No hay fases registradas.</p>
      )}

      {!loading && fases.length > 0 && (
        <>
          <ul className="grid gap-3">{fases.map(renderFaseItem)}</ul>
          {/* Vista visual si querés usar react-flow */}
          <DiagramaFases fases={fases} />
        </>
      )}

      {faseEditando && (
        <ModalFaseAdmin
          fase={faseEditando}
          token={token}
          onClose={() => setFaseEditando(null)}
          onActualizado={() => {
            cargarFases();
            setFaseEditando(null);
          }}
          competenciaId={competenciaId}
          fasesDisponibles={fases}
        />
      )}

      {modalNuevaFase && (
        <ModalFaseAdmin
          fase={null}
          token={token}
          onClose={() => setModalNuevaFase(false)}
          onActualizado={() => {
            cargarFases();
            setModalNuevaFase(false);
          }}
          competenciaId={competenciaId}
          fasesDisponibles={fases}
        />
      )}
    </section>
  );
}
