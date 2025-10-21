import React, { useState, useEffect } from 'react';

export function SeccionEstadisticasDirectas({
  partido,
  partidoId,
  token,
  onRefresh,
  setModalEstadisticasGeneralesAbierto
}) {
  const [estadisticasAutomaticas, setEstadisticasAutomaticas] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Cargar estadísticas automáticas para usar como valores por defecto
  useEffect(() => {
    const cargarEstadisticasAutomaticas = async () => {
      try {
        setCargando(true);
        const response = await fetch(
          `https://overtime-ddyl.onrender.com/api/estadisticas/jugador-partido?partido=${partidoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.ok) {
          const data = await response.json();
          setEstadisticasAutomaticas(data);
          console.log('📊 Estadísticas automáticas cargadas para autocompletado:', data.length);
        }
      } catch (error) {
        console.error('Error cargando estadísticas automáticas:', error);
      } finally {
        setCargando(false);
      }
    };

    if (partidoId && token) {
      cargarEstadisticasAutomaticas();
    }
  }, [partidoId, token]);

  const handleAbrirModal = () => {
    // Pasar las estadísticas automáticas como datos iniciales
    setModalEstadisticasGeneralesAbierto({
      datosIniciales: estadisticasAutomaticas,
      hayDatosAutomaticos: estadisticasAutomaticas.length > 0
    });
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-green-800">⚡ Estadísticas Directas</h4>
          <p className="text-sm text-green-700">Captura estadísticas directamente para todo el partido sin sets individuales</p>
          {estadisticasAutomaticas.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              💡 Se autocompletarán con {estadisticasAutomaticas.length} estadísticas automáticas disponibles
            </p>
          )}
        </div>
        <button
          onClick={handleAbrirModal}
          disabled={cargando}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {cargando ? 'Cargando...' : 'Capturar Estadísticas Generales'}
        </button>
      </div>

      <div className="text-center py-8">
        <div className="text-green-600 mb-2">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-green-700 text-sm">
          {estadisticasAutomaticas.length > 0
            ? `Haz clic para capturar datos. Se autocompletarán ${estadisticasAutomaticas.length} estadísticas existentes.`
            : 'Haz clic en "Capturar Estadísticas Generales" para ingresar datos manualmente'
          }
        </p>
      </div>
    </div>
  );
}
