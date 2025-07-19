import React, { useState, useEffect } from 'react';

export default function SeccionParticipacionFase({ faseId, temporadaId, token }) {
  const [participacionesTemporada, setParticipacionesTemporada] = useState([]);
  const [participacionesFase, setParticipacionesFase] = useState([]);
  const [participacionTemporadaSeleccionada, setParticipacionTemporadaSeleccionada] = useState('');
  const [grupo, setGrupo] = useState('');
  const [division, setDivision] = useState('');
  const [puntos, setPuntos] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // Carga participaciones temporada para la temporadaId (equipos en temporada)
const cargarParticipacionesTemporada = async () => {
  setError('');
  console.log('Cargando participaciones temporada para temporadaId:', temporadaId);
  try {
    const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-temporada?temporada=${temporadaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al cargar participaciones temporada');
    const data = await res.json();
    console.log('Participaciones temporada:', data);
    setParticipacionesTemporada(data); // <- Aquí extraemos el array
  } catch (err) {
    setError(err.message);
  }
};

  useEffect(() => {
    if (temporadaId) cargarParticipacionesTemporada();
  }, [temporadaId]);
  

  // Carga participaciones fase para la faseId
  const cargarParticipacionesFase = async () => {
    setError('');
    try {
      const res = await fetch(`https://overtime-ddyl.onrender.com/api/participacion-fase?fase=${faseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar participaciones fase');
      const data = await res.json();
      setParticipacionesFase(data);
    } catch (err) {
      setError(err.message);
    }
  };


  useEffect(() => {
    if (faseId) cargarParticipacionesFase();
  }, [faseId]);

  const crearParticipacionFase = async () => {
    setMensaje('');
    setError('');

    if (!faseId || !participacionTemporadaSeleccionada) {
      setError('Debe seleccionar una participación temporada y tener fase definida');
      return;
    }

    try {
      const res = await fetch('https://overtime-ddyl.onrender.com/api/participacion-fase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          fase: faseId,
          participacionTemporada: participacionTemporadaSeleccionada,
          grupo: grupo || null,
          division: division || null,
          puntos: Number(puntos) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al crear participación en fase');

      setMensaje('Participación en fase creada correctamente');
      setGrupo('');
      setDivision('');
      setPuntos(0);
      cargarParticipacionesFase();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Participación en Fase</h2>

      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="mb-4">
        <label className="block mb-1 font-medium">Equipo / Participación Temporada</label>
        <select
          className="w-full border p-2 rounded"
          value={participacionTemporadaSeleccionada}
          onChange={(e) => setParticipacionTemporadaSeleccionada(e.target.value)}
        >
          <option value="">Seleccione un equipo</option>
          {participacionesTemporada.map((pt) => (
            <option key={pt._id} value={pt._id}>
              {pt.equipo?.nombre || 'Sin nombre'} — Estado: {pt.estado}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Grupo</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
          placeholder="Ej: A, B, 1, 2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">División</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          placeholder="Ej: Primera, Segunda"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Puntos</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          value={puntos}
          onChange={(e) => setPuntos(e.target.value)}
          min={0}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={crearParticipacionFase}
      >
        Registrar Participación en Fase
      </button>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold mb-2">Participaciones en esta fase</h3>
      {participacionesFase.length === 0 && <p>No hay participaciones registradas aún.</p>}
      <ul className="list-disc list-inside max-h-64 overflow-auto">
        {participacionesFase.map(p => (
          <li key={p._id} className="mb-1">
            Equipo: <strong>{p.participacionTemporada?.equipo?.nombre || 'Sin equipo'}</strong> — Grupo: {p.grupo || '-'} — División: {p.division || '-'} — Puntos: {p.puntos}
          </li>
        ))}
      </ul>
    </div>
  );
}
