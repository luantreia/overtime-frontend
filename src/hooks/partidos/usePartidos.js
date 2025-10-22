import { useState, useEffect, useCallback } from 'react';
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
} from '../../services/partidoService';

export function usePartidos(token) {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los partidos (rápido): ir directo al endpoint público
  useEffect(() => {
    setLoading(true);
    cargarPartidos();
  }, [token]);

  const cargarPartidos = async () => {
    try {
      setLoading(true);
      const data = await fetchPartidos(token);
      setPartidos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setPartidos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarPartidoPorId = useCallback(async (id) => {
    try {
      const partido = await fetchPartidoById(id, token);
      return partido;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [token]);

  const crearNuevoPartido = useCallback(async (nuevo, callback) => {
    try {
      const creado = await agregarPartido(nuevo, token);
      setPartidos(prev => [creado, ...prev]);
      callback?.(creado);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const editarPartidoExistente = useCallback(async (id, data) => {
    try {
      const actualizado = await editarPartido(id, data, token);
      setPartidos(prev =>
        prev.map(p => (p._id === id ? actualizado : p))
      );
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const eliminarPartidoPorId = useCallback(async (id) => {
    try {
      await eliminarPartido(id, token);
      setPartidos(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const agregarSetAPartido = useCallback(async (partidoId, setData) => {
    try {
      console.log('Token en agregarSetAPartido:', token);
      return await agregarSet(partidoId, setData, token);
    } catch (err) {
      console.error('Error al agregar set desde hook:', err);
      setError(err.message);
      return null;
    }
  }, [token]);

  const actualizarSetDePartido = useCallback(async (partidoId, numeroSet, setData) => {
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
  }, [token]);

  const actualizarStatsDeSet = useCallback(async (partidoId, numeroSet, statsJugadoresSet) => {
    try {
      return await actualizarStatsSet(partidoId, numeroSet, statsJugadoresSet, token);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);
  const eliminarSetDePartido = useCallback(async (partidoId, numeroSet) => {
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
  }, [token]);

  return {
    partidos,
    loading,
    error,
    cargarPartidos,
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
