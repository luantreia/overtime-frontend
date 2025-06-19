// src/hooks/useEquipos.js
import { useState, useEffect } from 'react';
import {
  fetchEquipos,
  agregarEquipo,
  editarEquipo,
  eliminarEquipo,
} from '../services/equipoService';

export default function useEquipos(token) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const data = await fetchEquipos(token);
      setEquipos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregar = async (equipo) => {
    const nuevo = await agregarEquipo(equipo, token);
    setEquipos((prev) => [...prev, nuevo]);
  };

  const editar = async (id, equipo) => {
    const actualizado = await editarEquipo(id, equipo, token);
    setEquipos((prev) =>
      prev.map((eq) => (eq._id === id ? actualizado : eq))
    );
  };

  const eliminar = async (id) => {
    await eliminarEquipo(id, token);
    setEquipos((prev) => prev.filter((eq) => eq._id !== id));
  };

  useEffect(() => {
    if (token) cargarEquipos();
  }, [token]);

  return {
    equipos,
    loading,
    error,
    agregar,
    editar,
    eliminar,
  };
}
