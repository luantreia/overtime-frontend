import { useState, useEffect } from 'react';
import { obtenerOrganizaciones, crearOrganizacion } from '../../services/organizacionService';
import { useAuth } from '../../context/AuthContext';

export function useOrganizaciones() {
  const [organizaciones, setOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    cargarOrganizaciones();
    // Reintentar cuando el token cambie
  }, [token]);

  const cargarOrganizaciones = async () => {
    try {
      setLoading(true);
      // Si no hay token aún, ir directo a públicas para evitar 401
      if (!token) {
        const dataPublica = await obtenerOrganizaciones();
        setOrganizaciones(dataPublica);
        setError(null);
        return;
      }

      // Intentar cargar organizaciones administrables primero
      try {
        const response = await fetch(`https://overtime-ddyl.onrender.com/api/organizaciones/admin`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrganizaciones(data);
          setError(null);
          return;
        }
      } catch (adminError) {
        console.warn('No se pudieron cargar organizaciones admin, intentando públicas:', adminError.message);
      }

      // Fallback a organizaciones públicas
      const data = await obtenerOrganizaciones();
      setOrganizaciones(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar organizaciones');
      setOrganizaciones([]);
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
      throw new Error(err.message || 'Error al crear organizacion');
    }
  };

  return {
    organizaciones,
    loading,
    error,
    cargarOrganizaciones,
    agregarOrganizacion,
  };
}
