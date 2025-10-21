import { useState, useEffect, useCallback } from 'react';

export const usePing = (interval = 30000) => { // 30 segundos por defecto
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastPing, setLastPing] = useState(null);

  const ping = useCallback(async () => {
    // Primero verificar conectividad básica del navegador
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    try {
      // Usar AbortController para timeout agresivo (2 segundos)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('/api/ping', {
        method: 'HEAD', // Solo headers, más liviano
        cache: 'no-cache', // Evitar cache
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsOnline(true);
        setLastPing(new Date());
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      // Detectar diferentes tipos de error
      if (error.name === 'AbortError') {
        console.warn('Ping timeout - posible conexión lenta');
      } else {
        console.warn('Ping failed:', error.message);
      }
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    ping(); // Ping inicial
    const id = setInterval(ping, interval);
    return () => clearInterval(id);
  }, [ping, interval]);

  // Escuchar eventos de conectividad del navegador
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastPing };
};
