import { useState, useEffect } from 'react';
import {
  obtenerCompetencias,
  obtenerCompetenciaPorId,
  crearCompetencia,
  actualizarCompetencia,
  eliminarCompetencia,
} from '../../services/competenciaService';
import { useAuth } from '../../context/AuthContext';

export function useCompetencias() {
  const [competencias, setCompetencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // Cargar competencias automáticamente al montar
  useEffect(() => {
    cargarCompetencias();
  }, []);

  const cargarCompetencias = async () => {
    try {
      setLoading(true);
      // Intentar cargar competencias administrables primero
      try {
        const response = await fetch(`https://overtime-ddyl.onrender.com/api/competencias/admin`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const dataValida = data.map(c => ({ nombre: '', ...c }));
          setCompetencias(dataValida);
          setError(null);
          return;
        }
      } catch (adminError) {
        console.warn('No se pudieron cargar competencias admin, intentando públicas:', adminError.message);
      }

      // Fallback a competencias públicas
      const data = await obtenerCompetencias();
      const dataValida = data.map(c => ({ nombre: '', ...c }));
      setCompetencias(dataValida);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar competencias');
      setCompetencias([]);
    } finally {
      setLoading(false);
    }
  };

  const agregarCompetencia = async (nuevaComp) => {
    try {
      const data = await crearCompetencia(nuevaComp, token);
      setCompetencias((prev) => [...prev, { nombre: '', ...data }]);
      return data;
    } catch (err) {
      throw new Error(err.message || 'Error al crear competencia');
    }
  };

  const eliminarCompetenciaPorId = async (id) => {
    try {
      await eliminarCompetencia(id, token);
      setCompetencias((prev) => prev.filter((comp) => comp._id !== id));
    } catch (err) {
      throw new Error(err.message || 'Error al eliminar competencia');
    }
  };

  const actualizarCompetenciaPorId = async (id, datos) => {
    try {
      const actualizada = await actualizarCompetencia(id, datos, token);
      setCompetencias((prev) =>
        prev.map((comp) => (comp._id === id ? { nombre: '', ...actualizada } : comp))
      );
      return actualizada;
    } catch (err) {
      throw new Error(err.message || 'Error al actualizar competencia');
    }
  };

  return {
    competencias,
    loading,
    error,
    cargarCompetencias,
    agregarCompetencia,
    eliminarCompetenciaPorId,
    actualizarCompetenciaPorId,
  };
}

export function useCompetenciaPorId(id) {
  const [competencia, setCompetencia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const cargarCompetencia = async () => {
    try {
      setLoading(true);
      const data = await obtenerCompetenciaPorId(id, token);
      setCompetencia(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar competencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) cargarCompetencia();
  }, [id]);

  return {
    competencia,
    loading,
    error,
    refetch: cargarCompetencia,
  };
}
