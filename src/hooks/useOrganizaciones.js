import { useState, useEffect } from 'react';
import { obtenerOrganizaciones, crearOrganizacion } from '../services/organizacionService';
import { useAuth } from '../context/AuthContext';

export function useOrganizaciones() {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    cargarOrganizaciones();
  }, []);

  const cargarOrganizaciones = async () => {
    try {
      setLoading(true);
      const data = await obtenerOrganizaciones();
      setOrganizaciones(data);
    } catch (err) {
      setError(err.message || 'Error al cargar organizaciones');
    } finally {
      setLoading(false);
    }
  };

  const agregarOrganizacion = async (nuevaOrg) => {
    try {
      const data = await crearOrganizacion(nuevaOrg, token);
      setOrganizaciones(prev => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err.message || 'Error al crear organización');
    }
  };

  return {
    organizaciones,
    loading,
    error,
    agregarOrganizacion,
    cargarOrganizaciones,
  };
}
