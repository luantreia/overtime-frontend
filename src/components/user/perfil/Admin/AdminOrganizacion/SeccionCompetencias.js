import React, { useEffect, useState } from 'react';
import ModalCompetenciaAdmin from '../AdminCompetencia/ModalCompetenciaAdmin';

export default function SeccionCompetencias({ organizacionId, token }) {
  const [competencias, setCompetencias] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);

  const cargarCompetencias = async () => {
    const res = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const filtradas = data.filter(c => c.organizacion?._id === organizacionId);
    setCompetencias(filtradas);
  };

  useEffect(() => {
    cargarCompetencias();
  }, [organizacionId]);

  return (
    <section className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Competencias</h3>
      {competencias.length === 0 ? (
        <p className="text-gray-600">No hay competencias asociadas.</p>
      ) : (
        <ul className="space-y-1">
          {competencias.map(c => (
            <li key={c._id} className="flex justify-between items-center border p-2 rounded">
              <span>{c.nombre}</span>
              <button className="btn-secondary btn-sm" onClick={() => setSeleccionada(c)}>
                Administrar
              </button>
            </li>
          ))}
        </ul>
      )}

      {seleccionada && (
        <ModalCompetenciaAdmin
          competenciaId={seleccionada._id}
          token={token}
          onClose={() => {
            setSeleccionada(null);
            cargarCompetencias(); // refresca
          }}
        />
      )}
    </section>
  );
}
