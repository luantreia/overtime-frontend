import React, { useEffect, useState } from 'react';
import { useEquipoCompetencia } from '../../../hooks/useEquiposCompetencia';

function EditorEquipos({ competenciaId }) {
  const {
    equiposCompetencia,
    loading,
    error,
    agregarEquipo,
    eliminarEquipoCompetencia
  } = useEquipoCompetencia(competenciaId);

  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await fetch('https://overtime-ddyl.onrender.com/api/equipos');
        const data = await res.json();
        setEquipos(data);
      } catch (err) {
        console.error('Error cargando equipos:', err);
      }
    };
    fetchEquipos();
  }, []);

  const handleAgregar = async () => {
    if (!equipoSeleccionado) return alert('Selecciona un equipo');
    try {
      await agregarEquipo(equipoSeleccionado);
      setEquipoSeleccionado('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar equipo de competencia?')) {
      try {
        await eliminarEquipoCompetencia(id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-3">
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-1">
        {equiposCompetencia.map(ec => (
          <li key={ec._id} className="flex justify-between items-center">
            <span>{ec.equipo?.nombre || 'Equipo'}</span>
            <button onClick={() => handleEliminar(ec._id)} className="text-red-600 hover:text-red-800">✖</button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <select
          className="flex-1 border rounded p-2"
          value={equipoSeleccionado}
          onChange={e => setEquipoSeleccionado(e.target.value)}
        >
          <option value="">Selecciona equipo...</option>
          {equipos.filter(e =>
            !equiposCompetencia.some(ec =>
              (typeof ec.equipo === 'string' ? ec.equipo : ec.equipo?._id) === e._id
            )
          ).map(e => (
            <option key={e._id} value={e._id}>{e.nombre}</option>
          ))}
        </select>
        <button
          onClick={handleAgregar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

export default EditorEquipos;
