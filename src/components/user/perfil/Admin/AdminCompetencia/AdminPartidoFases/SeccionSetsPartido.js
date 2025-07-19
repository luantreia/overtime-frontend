import React, { useEffect, useState } from 'react';

export default function SeccionSetsPartido({ partidoId, token, editable = false }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = 'https://overtime-ddyl.onrender.com/api';

  const cargarSets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/sets?partido=${partidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar sets');
      const data = await res.json();
      setSets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const crearNuevoSet = async () => {
    const numeroSet = sets.length + 1;
    const res = await fetch(`${API}/sets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        partido: partidoId,
        numeroSet,
      }),
    });
    if (res.ok) {
      await cargarSets();
    } else {
      alert('Error al crear nuevo set');
    }
  };

  useEffect(() => {
    if (partidoId && token) cargarSets();
  }, [partidoId, token]);

  return (
    <div className="mb-4">
      <h5 className="font-semibold mb-2">Sets del Partido</h5>
      {loading && <p>Cargando sets...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="divide-y border rounded overflow-auto max-h-60 mb-2">
        {sets.map((set) => (
          <li key={set._id} className="p-2">
            Set {set.numeroSet}: {set.estadoSet} – Ganador: {set.ganadorSet}
          </li>
        ))}
      </ul>

      {editable && (
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={crearNuevoSet}
        >
          Agregar Set
        </button>
      )}
    </div>
  );
}
