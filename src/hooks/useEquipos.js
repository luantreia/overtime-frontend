// src/hooks/useEquipos.js
import { useState, useEffect } from 'react';
import {
  fetchEquipos,
  agregarEquipo,
  editarEquipo,
  eliminarEquipo,
} from '../services/equipoService';

export default function useEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const data = await fetchEquipos(); // 👈 sin token
      setEquipos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEquipos(); // 👈 cargar siempre
  }, []);

  return {
    equipos,
    loading,
    error,
    agregar: async (equipo, token) => {
      const nuevo = await agregarEquipo(equipo, token);
      setEquipos((prev) => [...prev, nuevo]);
    },
    editar: async (id, equipo, token) => {
      const actualizado = await editarEquipo(id, equipo, token);
      setEquipos((prev) =>
        prev.map((eq) => (eq._id === id ? actualizado : eq))
      );
      return actualizado;
    },
    eliminar: async (id, token) => {
      await eliminarEquipo(id, token);
      setEquipos((prev) => prev.filter((eq) => eq._id !== id));
    },
  };
}

