// src/hooks/api/useApi.js
import { useState, useCallback } from 'react';
import { API_CONFIG } from '../../utils/constants';

/**
 * Hook personalizado para llamadas a la API
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    const {
      method = 'GET',
      body = null,
      headers = {},
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.RETRY_ATTEMPTS
    } = options;

    // Construir URL completa
    let fullUrl = url;

    if (!url.startsWith('http')) {
      let normalizedPath = url;

      if (!normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.startsWith('api/')
          ? `/${normalizedPath}`
          : `/api/${normalizedPath.replace(/^\/?/, '')}`;
      } else if (!normalizedPath.startsWith('/api/')) {
        normalizedPath = `/api${normalizedPath}`;
      }

      fullUrl = `${API_CONFIG.BASE_URL}${normalizedPath}`;
    }

    // Configurar headers por defecto
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Configurar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: defaultHeaders,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Manejar respuestas no exitosas
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Si no se puede parsear el error, usar el mensaje por defecto
        }

        throw new Error(errorMessage);
      }

      // Para respuestas 204 (No Content), devolver null
      if (response.status === 204) {
        return null;
      }

      // Parsear respuesta JSON
      const data = await response.json();
      return data;

    } catch (err) {
      clearTimeout(timeoutId);

      // Si es error de abort (timeout), dar mensaje específico
      if (err.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo. Verifica tu conexión.');
      }

      // Si es error de red, dar mensaje específico
      if (err.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, options = {}) => {
    return callApi(url, { ...options, method: 'GET' });
  }, [callApi]);

  const post = useCallback((url, body, options = {}) => {
    return callApi(url, { ...options, method: 'POST', body });
  }, [callApi]);

  const put = useCallback((url, body, options = {}) => {
    return callApi(url, { ...options, method: 'PUT', body });
  }, [callApi]);

  const patch = useCallback((url, body, options = {}) => {
    return callApi(url, { ...options, method: 'PATCH', body });
  }, [callApi]);

  const del = useCallback((url, options = {}) => {
    return callApi(url, { ...options, method: 'DELETE' });
  }, [callApi]);

  return {
    loading,
    error,
    callApi,
    get,
    post,
    put,
    patch,
    delete: del,
    // Estado para usar en componentes
    isLoading: loading,
    hasError: error !== null
  };
};

export default useApi;
