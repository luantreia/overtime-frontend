// src/hooks/usePartidos.js
import { useState, useEffect } from 'react';
import {
  fetchPartidos,
  fetchPartidoById,
  agregarPartido,
  editarPartido,
  eliminarPartido,
  agregarSet,
  actualizarSet,
  actualizarStatsSet,
  eliminarSet
} from '../services/partidoService';

export function usePartidos(token) {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los partidos
  useEffect(() => {
    console.log('Token recibido en usePartidos:', token);

    setLoading(true);
    fetchPartidos(token)
      .then(data => {
        console.log('Partidos cargados:', data);
        setPartidos(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetchPartidos:', err);
        setError(err.message);
      })
      .finally(() => { 
        console.log('Carga finalizada');
        setLoading(false)
      });
  }, [token]);

  const cargarPartidoPorId = async (id) => {
    try {
      const partido = await fetchPartidoById(id, token);
      return partido;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const crearNuevoPartido = async (nuevo, callback) => {
    try {
      const creado = await agregarPartido(nuevo, token);
      setPartidos(prev => [creado, ...prev]);
      callback?.(creado);
    } catch (err) {
      setError(err.message);
    }
  };

  const editarPartidoExistente = async (id, data) => {
    try {
      const actualizado = await editarPartido(id, data, token);
      setPartidos(prev =>
        prev.map(p => (p._id === id ? actualizado : p))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminarPartidoPorId = async (id) => {
    try {
      await eliminarPartido(id, token);
      setPartidos(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const agregarSetAPartido = async (partidoId, setData) => {
    try {
      console.log('Token en agregarSetAPartido:', token);
      return await agregarSet(partidoId, setData, token);
    } catch (err) {
      console.error('Error al agregar set desde hook:', err);
      setError(err.message);
      return null;
    }
  };

  const actualizarSetDePartido = async (partidoId, numeroSet, setData) => {
    setError(null); // Limpiar error anterior si existía
    setLoading(true); // Opcional: si usás un estado de loading

    try {
      const actualizado = await actualizarSet(partidoId, numeroSet, setData, token);
      return actualizado; // Devolvés el partido actualizado
    } catch (err) {
      setError(err.message);
      return null; // Para que quien la llame sepa que falló
    } finally {
      setLoading(false); // Opcional
    }
  };

  const actualizarStatsDeSet = async (partidoId, numeroSet, statsJugadoresSet) => {
    try {
      return await actualizarStatsSet(partidoId, numeroSet, statsJugadoresSet, token);
    } catch (err) {
      setError(err.message);
    }
  };
  const eliminarSetDePartido = async (partidoId, numeroSet) => {
    try {
      await eliminarSet(partidoId, numeroSet, token);
      // Luego deberías recargar los sets o el partido para mantener estado actualizado
      // Por ejemplo:
      const partidoActualizado = await fetchPartidoById(partidoId, token);
      setPartidos(prev =>
        prev.map(p => (p._id === partidoId ? partidoActualizado : p))
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    partidos,
    loading,
    error,
    cargarPartidoPorId,
    crearNuevoPartido,
    editarPartidoExistente,
    eliminarPartidoPorId,
    agregarSetAPartido,
    actualizarSetDePartido,
    actualizarStatsDeSet,
    eliminarSetDePartido,
  };
}
