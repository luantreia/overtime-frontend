import { useState, useEffect } from 'react';
import {
  fetchJugadores,
  agregarJugador,
  editarJugador,
  eliminarJugador,
} from '../services/jugadorService';

export default function useJugadores(token) {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarJugadores = async () => {
    try {
      setLoading(true);
      const data = await fetchJugadores(token);
      setJugadores(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agregar = async (jugador) => {
    try {
      const nuevo = await agregarJugador(jugador, token);
      setJugadores((prev) => [...prev, nuevo]);
    } catch (err) {
      setError(err.message);
    }
  };

  const editar = async (id, jugador) => {
    try {
      const actualizado = await editarJugador(id, jugador, token);
      setJugadores((prev) =>
        prev.map((j) => (j._id === id ? actualizado : j))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    try {
      await eliminarJugador(id, token);
      setJugadores((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) cargarJugadores();
  }, [token]);

  return {
    jugadores,
    loading,
    error,
    agregar,
    editar,
    eliminar,
  };
}
