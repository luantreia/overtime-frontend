import { useState, useEffect } from 'react';
import {
  fetchEquipos,
  agregarEquipo,
  editarEquipo,
  eliminarEquipo,
} from '../../services/equipoService';
import { useAuth } from '../../context/AuthContext';

export function useEquipos(token) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEquipos = async () => {
    try {
      setLoading(true);
      const data = await fetchEquipos();
      setEquipos(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  };

  const agregarNuevoEquipo = async (nuevoEquipo) => {
    try {
      const data = await agregarEquipo(nuevoEquipo, token);
      setEquipos((prev) => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err.message || 'Error al crear equipo');
    }
  };

  const eliminarEquipoPorId = async (id) => {
    try {
      await eliminarEquipo(id, token);
      setEquipos((prev) => prev.filter((equipo) => equipo._id !== id));
    } catch (err) {
      throw new Error(err.message || 'Error al eliminar equipo');
    }
  };

  const editar = async (id, equipo) => {
    try {
      const actualizado = await editarEquipo(id, equipo, token);
      setEquipos((prev) =>
        prev.map((equipoItem) => (equipoItem._id === id ? actualizado : equipoItem))
      );
      return actualizado;
    } catch (err) {
      throw new Error(err.message || 'Error al actualizar equipo');
    }
  };

  return {
    equipos,
    loading,
    error,
    cargarEquipos,
    agregarEquipo: agregarNuevoEquipo,
    eliminarEquipoPorId,
    editar,
  };
}
